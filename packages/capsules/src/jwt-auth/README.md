# JWT Auth Capsule ♔

JWT (JSON Web Token) authentication with signing, verification, token management, and password hashing.

## Features

- **Token Signing**: Create JWT tokens with custom payloads
- **Token Verification**: Verify and validate JWT tokens
- **Access & Refresh Tokens**: Complete token pair management
- **Token Blacklisting**: Revoke tokens before expiration
- **HMAC & RSA**: Support for HS256/384/512 and RS256/384/512 algorithms
- **Password Hashing**: Secure password hashing with salt
- **Token Refresh**: Seamless token renewal
- **Statistics**: Track token operations
- **Type Safety**: Full TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: 'your-super-secret-key-min-32-chars',
  algorithm: 'HS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
});

// Create token
const result = await auth.sign({
  sub: 'user-123',
  email: 'user@example.com',
  role: 'admin'
});
console.log('Token:', result.token);

// Verify token
const verified = await auth.verify(result.token);
if (verified.valid) {
  console.log('User ID:', verified.payload?.sub);
  console.log('Email:', verified.payload?.email);
}
```

## API Reference

### Configuration

```typescript
interface JWTConfig {
  secret?: string;                  // For HMAC algorithms
  publicKey?: string;               // For RSA verification
  privateKey?: string;              // For RSA signing
  algorithm?: Algorithm;            // Default: 'HS256'
  accessTokenExpiry?: string;       // Default: '15m'
  refreshTokenExpiry?: string;      // Default: '7d'
  issuer?: string;
  audience?: string;
  clockTolerance?: number;          // Default: 60 seconds
}
```

### Methods

#### `sign(payload: TokenPayload, type?: TokenType, options?: TokenOptions): Promise<SignResult>`

Sign a JWT token.

```typescript
const result = await auth.sign({
  sub: 'user-123',
  email: 'user@example.com',
  role: 'admin',
  permissions: ['read', 'write']
}, 'access');
```

#### `verify(token: string): Promise<VerifyResult>`

Verify a JWT token.

```typescript
const result = await auth.verify(token);
if (result.valid) {
  console.log('Payload:', result.payload);
} else {
  console.log('Error:', result.error);
}
```

#### `verifyFromHeader(authHeader: string): Promise<VerifyResult>`

Verify token from Authorization header.

```typescript
const result = await auth.verifyFromHeader('Bearer eyJhbGc...');
```

#### `createTokenPair(payload: TokenPayload): Promise<RefreshTokenPair>`

Create access and refresh token pair.

```typescript
const tokens = await auth.createTokenPair({
  sub: 'user-123',
  email: 'user@example.com'
});
console.log('Access:', tokens.accessToken);
console.log('Refresh:', tokens.refreshToken);
```

#### `refreshAccessToken(refreshToken: string): Promise<RefreshTokenPair>`

Refresh access token using refresh token.

```typescript
const newTokens = await auth.refreshAccessToken(oldRefreshToken);
```

#### `revokeToken(token: string): Promise<void>`

Revoke/blacklist a token.

```typescript
await auth.revokeToken(token);
```

#### `revokeAllUserTokens(userId: string): Promise<void>`

Revoke all tokens for a user.

```typescript
await auth.revokeAllUserTokens('user-123');
```

#### `decode(token: string): DecodedToken | null`

Decode token without verification.

```typescript
const decoded = auth.decode(token);
console.log('Expires at:', new Date(decoded.exp * 1000));
```

#### `hashPassword(password: string): { hash: string; salt: string }`

Hash a password securely.

```typescript
const { hash, salt } = auth.hashPassword('userPassword123!');
```

#### `verifyPassword(password: string, hash: string, salt: string): boolean`

Verify password against hash.

```typescript
const isValid = auth.verifyPassword('userPassword123!', storedHash, storedSalt);
```

#### `getStats(): JWTStats`

Get authentication statistics.

```typescript
const stats = auth.getStats();
console.log('Total signed:', stats.totalSigned);
console.log('Total verified:', stats.totalVerified);
```

#### `cleanup(): Promise<void>`

Cleanup resources.

```typescript
await auth.cleanup();
```

## Examples

### Basic Authentication Flow

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
});

// User registration
const password = 'SecurePass123!';
const { hash, salt } = auth.hashPassword(password);

await db.users.create({
  email: 'user@example.com',
  passwordHash: hash,
  salt: salt
});

// User login
const user = await db.users.findByEmail('user@example.com');
const isValid = auth.verifyPassword(password, user.passwordHash, user.salt);

if (isValid) {
  const tokens = await auth.createTokenPair({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 900 // 15 minutes
  });
} else {
  res.status(401).json({ error: 'Invalid credentials' });
}
```

### Protected Route Middleware

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const result = await auth.verifyFromHeader(authHeader);
    if (!result.valid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Use in routes
app.get('/api/profile', authMiddleware, async (req, res) => {
  const user = await db.users.findById(req.user.sub);
  res.json(user);
});
```

### Token Refresh Endpoint

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const newTokens = await auth.refreshAccessToken(refreshToken);

    res.json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: 900
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### Role-Based Access Control

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

function requireRole(...allowedRoles: string[]) {
  return async (req, res, next) => {
    try {
      const result = await auth.verifyFromHeader(req.headers.authorization);

      if (!result.valid || !result.payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userRole = result.payload.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = result.payload;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

// Admin-only endpoint
app.delete('/api/users/:id', requireRole('admin'), async (req, res) => {
  await db.users.delete(req.params.id);
  res.json({ success: true });
});

// Admin or moderator
app.post('/api/posts/:id/approve', requireRole('admin', 'moderator'), async (req, res) => {
  await db.posts.approve(req.params.id);
  res.json({ success: true });
});
```

### Permission-Based Access

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

// Sign token with permissions
const tokens = await auth.createTokenPair({
  sub: 'user-123',
  email: 'user@example.com',
  role: 'editor',
  permissions: ['posts:read', 'posts:write', 'comments:read']
});

// Permission middleware
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const result = await auth.verifyFromHeader(req.headers.authorization);

    if (!result.valid || !result.payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const permissions = result.payload.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }

    req.user = result.payload;
    next();
  };
}

// Use permission middleware
app.post('/api/posts', requirePermission('posts:write'), async (req, res) => {
  const post = await db.posts.create(req.body);
  res.json(post);
});
```

### Token Revocation

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

// Logout endpoint - revoke tokens
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const result = await auth.verifyFromHeader(authHeader);

    if (result.valid && result.payload) {
      // Revoke current token
      const token = authHeader.replace('Bearer ', '');
      await auth.revokeToken(token);

      res.json({ message: 'Logged out successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Force logout all user sessions
app.post('/api/admin/revoke-user/:userId', async (req, res) => {
  await auth.revokeAllUserTokens(req.params.userId);
  res.json({ message: 'All user tokens revoked' });
});
```

### RSA Algorithm (Public/Private Key)

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';
import fs from 'fs';

const auth = await createJWTAuthService({
  algorithm: 'RS256',
  privateKey: fs.readFileSync('./private-key.pem', 'utf8'),
  publicKey: fs.readFileSync('./public-key.pem', 'utf8')
});

// Sign with private key
const result = await auth.sign({
  sub: 'user-123',
  email: 'user@example.com'
});

// Verify with public key
const verified = await auth.verify(result.token);
console.log('Valid:', verified.valid);
```

### Custom Token Claims

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!,
  issuer: 'my-app.com',
  audience: 'my-app-users'
});

// Sign with custom claims
const result = await auth.sign({
  sub: 'user-123',
  email: 'user@example.com',
  customField: 'customValue',
  metadata: { plan: 'premium', credits: 100 }
}, 'access', {
  issuer: 'my-app.com',
  audience: 'my-app-users'
});

// Verify checks issuer and audience
const verified = await auth.verify(result.token);
console.log('Metadata:', verified.payload?.metadata);
```

### Password Reset Flow

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  if (!user) {
    return res.json({ message: 'If email exists, reset link sent' });
  }

  // Create reset token (short expiry)
  const resetToken = await auth.sign({
    sub: user.id,
    email: user.email,
    type: 'reset'
  }, 'reset', {
    expiresIn: '1h'
  });

  // Send email with reset link
  await sendEmail(user.email, {
    subject: 'Password Reset',
    body: `Reset link: https://app.com/reset?token=${resetToken.token}`
  });

  res.json({ message: 'If email exists, reset link sent' });
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const verified = await auth.verify(token);
    if (!verified.valid || !verified.payload) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash new password
    const { hash, salt } = auth.hashPassword(newPassword);

    await db.users.update(verified.payload.sub, {
      passwordHash: hash,
      salt: salt
    });

    // Revoke reset token
    await auth.revokeToken(token);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: 'Password reset failed' });
  }
});
```

### Monitoring Token Statistics

```typescript
import { createJWTAuthService } from '@capsulas/capsules/jwt-auth';

const auth = await createJWTAuthService({
  secret: process.env.JWT_SECRET!
});

// Perform operations
await auth.sign({ sub: 'user-1' });
await auth.sign({ sub: 'user-2' });
await auth.createTokenPair({ sub: 'user-3' });

// Check statistics
const stats = auth.getStats();
console.log('=== JWT Statistics ===');
console.log(`Total tokens signed: ${stats.totalSigned}`);
console.log(`Total tokens verified: ${stats.totalVerified}`);
console.log(`Total refreshed: ${stats.totalRefreshed}`);
console.log(`Failed verifications: ${stats.failedVerifications}`);
console.log(`Expired tokens: ${stats.expiredTokens}`);
console.log(`Blacklisted tokens: ${stats.blacklistedTokens}`);
console.log(`Average sign time: ${stats.averageSignTime}ms`);
console.log(`Average verify time: ${stats.averageVerifyTime}ms`);

console.log('\nBy Token Type:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
```

## Error Types

The JWT Auth Capsule includes 10 specialized error types:

- `SIGN_ERROR` - Token signing failed
- `VERIFY_ERROR` - Token verification failed
- `EXPIRED_ERROR` - Token has expired
- `INVALID_TOKEN_ERROR` - Invalid token format
- `BLACKLISTED_ERROR` - Token has been revoked
- `INVALID_SIGNATURE_ERROR` - Token signature invalid
- `SECRET_ERROR` - Invalid or missing secret/keys
- `REFRESH_ERROR` - Token refresh failed
- `PASSWORD_ERROR` - Password validation failed
- `AUTHENTICATION_ERROR` - Authentication failed

```typescript
import { JWTError, JWTErrorType } from '@capsulas/capsules/jwt-auth';

try {
  await auth.verify(token);
} catch (error) {
  if (error instanceof JWTError) {
    switch (error.type) {
      case JWTErrorType.EXPIRED_ERROR:
        console.log('Token expired, please login again');
        break;
      case JWTErrorType.BLACKLISTED_ERROR:
        console.log('Token has been revoked');
        break;
      case JWTErrorType.INVALID_SIGNATURE_ERROR:
        console.log('Token signature is invalid');
        break;
    }
  }
}
```

## Best Practices

1. **Secret Management**: Store secrets in environment variables, never in code
2. **Token Expiry**: Use short expiry for access tokens (15m), longer for refresh (7d)
3. **HTTPS Only**: Always transmit tokens over HTTPS
4. **Password Requirements**: Enforce strong password policies
5. **Token Refresh**: Implement token refresh flow for seamless UX
6. **Revocation**: Implement token blacklist for logout functionality
7. **Algorithm Choice**: Use RS256 for distributed systems, HS256 for single server
8. **Clock Skew**: Set reasonable clockTolerance for distributed systems

## License

MIT
