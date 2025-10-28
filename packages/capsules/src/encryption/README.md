# Encryption Capsule ♜

AES encryption, decryption, and cryptographic hashing with Node.js crypto library.

## Features

- **AES Encryption**: AES-256-GCM encryption with automatic IV generation
- **Secure Decryption**: Authenticated decryption with integrity verification
- **Cryptographic Hashing**: SHA-256, SHA-512, MD5 hashing algorithms
- **Key Management**: Secure key generation and validation
- **Type Safety**: Full TypeScript support with strict mode
- **Statistics Tracking**: Monitor encryption/decryption operations
- **Error Handling**: 8+ specialized error types

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';

const encryption = await createEncryptionService({
  algorithm: 'aes-256-gcm',
  key: 'your-32-byte-secret-key-here!!'
});

// Encrypt sensitive data
const encrypted = encryption.encrypt('Secret message');
console.log(encrypted.encrypted); // Hex-encoded ciphertext
console.log(encrypted.iv);        // Initialization vector

// Decrypt
const decrypted = encryption.decrypt(
  encrypted.encrypted,
  encrypted.iv,
  encrypted.authTag
);
console.log(decrypted.decrypted); // 'Secret message'

// Hash passwords
const hashed = encryption.hash('myPassword123', 'sha256');
console.log(hashed.hash);      // Hex-encoded hash
console.log(hashed.algorithm); // 'sha256'
```

## API Reference

### Configuration

```typescript
interface EncryptionConfig {
  algorithm?: string;           // Default: 'aes-256-gcm'
  key: string;                  // Required: Encryption key
  encoding?: BufferEncoding;    // Default: 'hex'
  hashAlgorithm?: string;       // Default: 'sha256'
}
```

### Methods

#### `encrypt(text: string): EncryptionResult`

Encrypts plaintext using AES-256-GCM.

```typescript
const result = encryption.encrypt('Sensitive data');
// Returns: { encrypted: string, iv: string, authTag?: string, algorithm: string }
```

#### `decrypt(encrypted: string, iv: string, authTag?: string): DecryptionResult`

Decrypts ciphertext with integrity verification.

```typescript
const result = encryption.decrypt(
  '8f3a9b2c...',
  'a1b2c3d4...',
  'e5f6g7h8...'
);
// Returns: { decrypted: string, algorithm: string, verified: boolean }
```

#### `hash(text: string, algorithm?: string): HashResult`

Generates cryptographic hash.

```typescript
const result = encryption.hash('password', 'sha256');
// Returns: { hash: string, algorithm: string, length: number }
```

#### `verifyHash(text: string, hash: string, algorithm?: string): boolean`

Verifies text matches hash.

```typescript
const isValid = encryption.verifyHash('password', storedHash, 'sha256');
// Returns: true if match, false otherwise
```

#### `getStats(): EncryptionStats`

Returns encryption statistics.

```typescript
const stats = encryption.getStats();
console.log(stats.totalEncryptions);  // 42
console.log(stats.totalDecryptions);  // 38
console.log(stats.totalHashes);       // 105
console.log(stats.algorithms.aes);    // 80
```

#### `getConfig(): Readonly<EncryptionConfig>`

Returns current configuration.

```typescript
const config = encryption.getConfig();
console.log(config.algorithm); // 'aes-256-gcm'
```

#### `cleanup(): Promise<void>`

Cleanup resources and reset state.

```typescript
await encryption.cleanup();
```

## Examples

### Encrypting User Data

```typescript
import { EncryptionService } from '@capsulas/capsules/encryption';

const encryption = new EncryptionService({
  key: process.env.ENCRYPTION_KEY!,
  algorithm: 'aes-256-gcm'
});

await encryption.initialize();

// Store encrypted user data
const userData = { email: 'user@example.com', ssn: '123-45-6789' };
const encrypted = encryption.encrypt(JSON.stringify(userData));

await db.users.update({
  encryptedData: encrypted.encrypted,
  iv: encrypted.iv,
  authTag: encrypted.authTag
});
```

### Password Hashing

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';

const encryption = await createEncryptionService({
  key: 'not-used-for-hashing',
  hashAlgorithm: 'sha256'
});

// Hash password on registration
const password = 'userPassword123!';
const hashed = encryption.hash(password);
await db.users.create({
  email: 'user@example.com',
  passwordHash: hashed.hash
});

// Verify password on login
const user = await db.users.findByEmail('user@example.com');
const isValid = encryption.verifyHash(password, user.passwordHash);

if (isValid) {
  console.log('Login successful');
} else {
  console.log('Invalid credentials');
}
```

### Encrypting API Keys

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';

const encryption = await createEncryptionService({
  key: process.env.MASTER_KEY!
});

// Encrypt third-party API keys
const apiKeys = {
  stripe: 'sk_live_...',
  sendgrid: 'SG.abc...',
  aws: 'AKIA...'
};

const encryptedKeys = Object.entries(apiKeys).map(([service, key]) => {
  const encrypted = encryption.encrypt(key);
  return {
    service,
    encrypted: encrypted.encrypted,
    iv: encrypted.iv,
    authTag: encrypted.authTag
  };
});

// Store encrypted keys
await db.secrets.insertMany(encryptedKeys);

// Decrypt when needed
const storedKey = await db.secrets.findOne({ service: 'stripe' });
const decrypted = encryption.decrypt(
  storedKey.encrypted,
  storedKey.iv,
  storedKey.authTag
);
console.log('Stripe API Key:', decrypted.decrypted);
```

### File Encryption

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';
import fs from 'fs/promises';

const encryption = await createEncryptionService({
  key: 'secure-file-encryption-key-32b',
  algorithm: 'aes-256-gcm'
});

// Encrypt file contents
const fileContent = await fs.readFile('sensitive-document.txt', 'utf8');
const encrypted = encryption.encrypt(fileContent);

// Save encrypted file with metadata
await fs.writeFile('document.enc', JSON.stringify({
  data: encrypted.encrypted,
  iv: encrypted.iv,
  authTag: encrypted.authTag,
  algorithm: encrypted.algorithm
}));

// Decrypt file
const encryptedFile = JSON.parse(
  await fs.readFile('document.enc', 'utf8')
);
const decrypted = encryption.decrypt(
  encryptedFile.data,
  encryptedFile.iv,
  encryptedFile.authTag
);

await fs.writeFile('decrypted-document.txt', decrypted.decrypted);
console.log('File decrypted successfully');
```

### Secure Token Generation

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';
import { generateKey } from '@capsulas/capsules/encryption';

const encryption = await createEncryptionService({
  key: generateKey(),
  hashAlgorithm: 'sha512'
});

// Generate secure reset token
const userId = '12345';
const timestamp = Date.now();
const tokenData = `${userId}:${timestamp}`;

const token = encryption.hash(tokenData, 'sha512');

// Store token
await db.resetTokens.create({
  userId,
  token: token.hash,
  expiresAt: new Date(timestamp + 3600000) // 1 hour
});

// Verify token
const storedToken = await db.resetTokens.findOne({ userId });
const isValid = encryption.verifyHash(
  tokenData,
  storedToken.token,
  'sha512'
);
```

### Monitoring Statistics

```typescript
import { createEncryptionService } from '@capsulas/capsules/encryption';

const encryption = await createEncryptionService({
  key: process.env.ENCRYPTION_KEY!
});

// Perform operations
encryption.encrypt('data1');
encryption.encrypt('data2');
encryption.hash('password');

// Check statistics
const stats = encryption.getStats();
console.log('Total encryptions:', stats.totalEncryptions);  // 2
console.log('Total hashes:', stats.totalHashes);            // 1
console.log('Total operations:', stats.totalOperations);     // 3
console.log('Success rate:', stats.successRate);            // 100
console.log('AES operations:', stats.algorithms.aes);       // 2
console.log('SHA operations:', stats.algorithms.sha);       // 1

// Monitor failed operations
try {
  encryption.decrypt('invalid', 'data');
} catch (error) {
  const updatedStats = encryption.getStats();
  console.log('Failed operations:', updatedStats.failedOperations); // 1
}
```

## Error Types

The Encryption Capsule includes 8 specialized error types:

- `ENCRYPTION_ERROR` - Encryption operation failed
- `DECRYPTION_ERROR` - Decryption operation failed
- `KEY_ERROR` - Invalid or missing encryption key
- `ALGORITHM_ERROR` - Unsupported algorithm
- `IV_ERROR` - Invalid initialization vector
- `HASH_ERROR` - Hashing operation failed
- `VERIFICATION_ERROR` - Hash verification failed
- `AUTH_TAG_ERROR` - Authentication tag validation failed

```typescript
import { EncryptionError, EncryptionErrorType } from '@capsulas/capsules/encryption';

try {
  encryption.encrypt('data');
} catch (error) {
  if (error instanceof EncryptionError) {
    if (error.type === EncryptionErrorType.KEY_ERROR) {
      console.error('Invalid key:', error.message);
    }
  }
}
```

## Best Practices

1. **Key Management**: Never hardcode encryption keys. Use environment variables or secure vaults.
2. **Algorithm Selection**: Use AES-256-GCM for encryption (provides authentication).
3. **Password Hashing**: Use SHA-256 or SHA-512 for passwords, or better yet use bcrypt/argon2.
4. **IV Storage**: Always store the IV alongside encrypted data - it's not secret.
5. **Auth Tags**: For GCM mode, always verify auth tags to prevent tampering.
6. **Key Rotation**: Implement key rotation policies for long-term security.
7. **Error Handling**: Always handle encryption errors gracefully.

## License

MIT
