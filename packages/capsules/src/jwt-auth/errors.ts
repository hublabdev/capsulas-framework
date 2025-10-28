/**
 * JWT Auth Capsule - Errors
 */

export enum JWTErrorType {
  SIGN_ERROR = 'SIGN_ERROR',
  VERIFY_ERROR = 'VERIFY_ERROR',
  EXPIRED_ERROR = 'EXPIRED_ERROR',
  INVALID_TOKEN_ERROR = 'INVALID_TOKEN_ERROR',
  BLACKLISTED_ERROR = 'BLACKLISTED_ERROR',
  INVALID_SIGNATURE_ERROR = 'INVALID_SIGNATURE_ERROR',
  SECRET_ERROR = 'SECRET_ERROR',
  REFRESH_ERROR = 'REFRESH_ERROR',
  PASSWORD_ERROR = 'PASSWORD_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
}

export class JWTError extends Error {
  constructor(
    public type: JWTErrorType,
    message: string,
    public originalError?: Error,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'JWTError';
    Object.setPrototypeOf(this, JWTError.prototype);
  }
}

export function createSignError(message: string, error?: Error): JWTError {
  return new JWTError(JWTErrorType.SIGN_ERROR, message, error);
}

export function createVerifyError(message: string, error?: Error): JWTError {
  return new JWTError(JWTErrorType.VERIFY_ERROR, message, error);
}

export function createExpiredError(expiredAt: number): JWTError {
  return new JWTError(
    JWTErrorType.EXPIRED_ERROR,
    'Token has expired',
    undefined,
    { expiredAt, expiredSince: Date.now() - expiredAt }
  );
}

export function createInvalidTokenError(message: string): JWTError {
  return new JWTError(JWTErrorType.INVALID_TOKEN_ERROR, message);
}

export function createBlacklistedError(jti?: string): JWTError {
  return new JWTError(
    JWTErrorType.BLACKLISTED_ERROR,
    'Token has been blacklisted',
    undefined,
    { jti }
  );
}

export function createInvalidSignatureError(): JWTError {
  return new JWTError(
    JWTErrorType.INVALID_SIGNATURE_ERROR,
    'Invalid token signature'
  );
}

export function createSecretError(message: string): JWTError {
  return new JWTError(JWTErrorType.SECRET_ERROR, message);
}

export function createRefreshError(message: string): JWTError {
  return new JWTError(JWTErrorType.REFRESH_ERROR, message);
}

export function createPasswordError(message: string): JWTError {
  return new JWTError(JWTErrorType.PASSWORD_ERROR, message);
}

export function createAuthenticationError(message: string): JWTError {
  return new JWTError(JWTErrorType.AUTHENTICATION_ERROR, message);
}
