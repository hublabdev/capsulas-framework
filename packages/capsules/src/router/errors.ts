export enum RouterErrorType {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  NAVIGATION_FAILED = 'NAVIGATION_FAILED',
  INVALID_PATH = 'INVALID_PATH',
  GUARD_REJECTED = 'GUARD_REJECTED',
  HANDLER_ERROR = 'HANDLER_ERROR',
  HISTORY_NOT_SUPPORTED = 'HISTORY_NOT_SUPPORTED',
  DUPLICATE_ROUTE = 'DUPLICATE_ROUTE',
  INVALID_CONFIG = 'INVALID_CONFIG',
}

export class RouterError extends Error {
  constructor(
    public type: RouterErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RouterError';
  }
}