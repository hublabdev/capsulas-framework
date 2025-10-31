/**
 * @capsulas/capsules - Google OAuth Errors
 */

export enum GoogleOAuthErrorType {
  INVALID_CONFIG = 'INVALID_CONFIG',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  PROFILE_FETCH_FAILED = 'PROFILE_FETCH_FAILED',
  INVALID_STATE = 'INVALID_STATE',
  INVALID_CODE = 'INVALID_CODE',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class GoogleOAuthError extends Error {
  constructor(
    public type: GoogleOAuthErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GoogleOAuthError';
  }
}

export class InvalidConfigError extends GoogleOAuthError {
  constructor(message: string, details?: any) {
    super(GoogleOAuthErrorType.INVALID_CONFIG, message, details);
    this.name = 'InvalidConfigError';
  }
}

export class AuthorizationError extends GoogleOAuthError {
  constructor(message: string, details?: any) {
    super(GoogleOAuthErrorType.AUTHORIZATION_FAILED, message, details);
    this.name = 'AuthorizationError';
  }
}

export class TokenExchangeError extends GoogleOAuthError {
  constructor(message: string, details?: any) {
    super(GoogleOAuthErrorType.TOKEN_EXCHANGE_FAILED, message, details);
    this.name = 'TokenExchangeError';
  }
}

export class TokenRefreshError extends GoogleOAuthError {
  constructor(message: string, details?: any) {
    super(GoogleOAuthErrorType.TOKEN_REFRESH_FAILED, message, details);
    this.name = 'TokenRefreshError';
  }
}

export class ProfileFetchError extends GoogleOAuthError {
  constructor(message: string, details?: any) {
    super(GoogleOAuthErrorType.PROFILE_FETCH_FAILED, message, details);
    this.name = 'ProfileFetchError';
  }
}
