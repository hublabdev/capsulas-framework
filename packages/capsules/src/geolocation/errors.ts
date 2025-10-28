export enum GeolocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
  API_ERROR = 'API_ERROR',
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
}

export class GeolocationError extends Error {
  constructor(
    public type: GeolocationErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}