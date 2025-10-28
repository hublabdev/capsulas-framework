export enum OAuthErrorType {
  INVALID_CONFIG = 'INVALID_CONFIG',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  INVALID_STATE = 'INVALID_STATE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_GRANT = 'INVALID_GRANT',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  USER_INFO_FAILED = 'USER_INFO_FAILED',
  INVALID_PROVIDER = 'INVALID_PROVIDER',
}

export class OAuthError extends Error {
  constructor(
    public type: OAuthErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}