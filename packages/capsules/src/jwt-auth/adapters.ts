/**
 * JWT Auth Capsule - Adapters
 */

import * as crypto from 'crypto';
import type {
  JWTConfig,
  TokenPayload,
  TokenOptions,
  SignResult,
  VerifyResult,
  DecodedToken,
  TokenType,
  Algorithm,
} from './types';
import {
  base64UrlEncode,
  decodeTokenPayload,
  calculateExpiryTimestamp,
  isExpired,
  generateJTI,
} from './utils';
import {
  createSignError,
  createVerifyError,
  createExpiredError,
  createInvalidTokenError,
  createInvalidSignatureError,
  createSecretError,
} from './errors';

export class JWTAdapter {
  constructor(private config: JWTConfig) {
    this.validateConfig();
  }

  private validateConfig(): void {
    const { algorithm, secret, publicKey, privateKey } = this.config;

    // HMAC algorithms require secret
    if (algorithm?.startsWith('HS') && !secret) {
      throw createSecretError('Secret key is required for HMAC algorithms');
    }

    // RSA algorithms require keys
    if (algorithm?.startsWith('RS') && (!publicKey || !privateKey)) {
      throw createSecretError('Public and private keys are required for RSA algorithms');
    }
  }

  sign(payload: TokenPayload, type: TokenType = 'access', options?: TokenOptions): SignResult {
    try {
      const header = {
        alg: this.config.algorithm || 'HS256',
        typ: 'JWT',
      };

      const now = Math.floor(Date.now() / 1000);
      const jti = generateJTI();

      // Determine expiry
      let expiresIn: string | number;
      if (options?.expiresIn) {
        expiresIn = options.expiresIn;
      } else if (type === 'refresh') {
        expiresIn = this.config.refreshTokenExpiry || '7d';
      } else {
        expiresIn = this.config.accessTokenExpiry || '15m';
      }

      const exp = calculateExpiryTimestamp(expiresIn);

      const fullPayload = {
        ...payload,
        iat: now,
        exp,
        jti,
        iss: options?.issuer || this.config.issuer,
        aud: options?.audience || this.config.audience,
        sub: options?.subject || payload.sub,
      };

      // Create token
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
      const signatureInput = `${encodedHeader}.${encodedPayload}`;

      const signature = this.createSignature(signatureInput);
      const token = `${signatureInput}.${signature}`;

      return {
        token,
        expiresAt: exp * 1000,
        type,
        payload: fullPayload,
      };
    } catch (error) {
      throw createSignError('Failed to sign token', error as Error);
    }
  }

  verify(token: string): VerifyResult {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw createInvalidTokenError('Invalid token format');
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      const signatureInput = `${encodedHeader}.${encodedPayload}`;

      // Verify signature
      const validSignature = this.verifySignature(signatureInput, signature);
      if (!validSignature) {
        throw createInvalidSignatureError();
      }

      // Decode payload
      const payload = decodeTokenPayload(token) as DecodedToken;
      if (!payload) {
        throw createInvalidTokenError('Invalid token payload');
      }

      // Check expiration
      if (isExpired(payload.exp, this.config.clockTolerance)) {
        throw createExpiredError(payload.exp * 1000);
      }

      // Verify claims
      if (this.config.issuer && payload.iss !== this.config.issuer) {
        throw createVerifyError('Invalid issuer');
      }

      if (this.config.audience) {
        const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        if (!audiences.includes(this.config.audience)) {
          throw createVerifyError('Invalid audience');
        }
      }

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          valid: false,
          error: error.message,
          expired: error.message.includes('expired'),
        };
      }
      return {
        valid: false,
        error: 'Verification failed',
      };
    }
  }

  private createSignature(input: string): string {
    const algorithm = this.config.algorithm || 'HS256';

    if (algorithm.startsWith('HS')) {
      return this.createHMACSignature(input, algorithm);
    } else if (algorithm.startsWith('RS')) {
      return this.createRSASignature(input, algorithm);
    }

    throw createSignError(`Unsupported algorithm: ${algorithm}`);
  }

  private createHMACSignature(input: string, algorithm: Algorithm): string {
    const hmacAlgorithm = algorithm.replace('HS', 'sha');
    const hmac = crypto.createHmac(hmacAlgorithm, this.config.secret!);
    hmac.update(input);
    return base64UrlEncode(hmac.digest());
  }

  private createRSASignature(input: string, algorithm: Algorithm): string {
    const rsaAlgorithm = algorithm.replace('RS', 'RSA-SHA');
    const sign = crypto.createSign(rsaAlgorithm);
    sign.update(input);
    sign.end();
    const signature = sign.sign(this.config.privateKey!, 'base64');
    return base64UrlEncode(Buffer.from(signature, 'base64'));
  }

  private verifySignature(input: string, signature: string): boolean {
    const algorithm = this.config.algorithm || 'HS256';

    if (algorithm.startsWith('HS')) {
      return this.verifyHMACSignature(input, signature, algorithm);
    } else if (algorithm.startsWith('RS')) {
      return this.verifyRSASignature(input, signature, algorithm);
    }

    return false;
  }

  private verifyHMACSignature(input: string, signature: string, algorithm: Algorithm): boolean {
    const expectedSignature = this.createHMACSignature(input, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private verifyRSASignature(input: string, signature: string, algorithm: Algorithm): boolean {
    const rsaAlgorithm = algorithm.replace('RS', 'RSA-SHA');
    const verify = crypto.createVerify(rsaAlgorithm);
    verify.update(input);
    verify.end();

    // Decode signature from base64url
    const decodedSignature = Buffer.from(signature, 'base64url');
    return verify.verify(this.config.publicKey!, decodedSignature);
  }

  decode(token: string): DecodedToken | null {
    return decodeTokenPayload(token);
  }
}

export function createAdapter(config: JWTConfig): JWTAdapter {
  return new JWTAdapter(config);
}
