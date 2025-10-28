/**
 * Encryption Capsule - Errors
 */

export enum EncryptionErrorType {
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DECRYPTION_ERROR = 'DECRYPTION_ERROR',
  KEY_ERROR = 'KEY_ERROR',
  ALGORITHM_ERROR = 'ALGORITHM_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  HASH_ERROR = 'HASH_ERROR',
  IV_ERROR = 'IV_ERROR',
  TAG_ERROR = 'TAG_ERROR',
}

export class EncryptionError extends Error {
  constructor(message: string, public readonly type: EncryptionErrorType, public readonly details?: any) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class EncryptionFailedError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.ENCRYPTION_ERROR, details);
  }
}

export class DecryptionFailedError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.DECRYPTION_ERROR, details);
  }
}

export class KeyError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.KEY_ERROR, details);
  }
}

export class AlgorithmError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.ALGORITHM_ERROR, details);
  }
}

export class InvalidInputError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.INVALID_INPUT, details);
  }
}

export class HashError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.HASH_ERROR, details);
  }
}

export class IVError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.IV_ERROR, details);
  }
}

export class TagError extends EncryptionError {
  constructor(message: string, details?: any) {
    super(message, EncryptionErrorType.TAG_ERROR, details);
  }
}
