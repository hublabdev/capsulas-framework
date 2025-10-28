/**
 * Search Capsule - Errors
 */

export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

export class SearchProviderError extends SearchError {
  constructor(provider: string, message: string) {
    super(`${provider} error: ${message}`);
    this.name = 'SearchProviderError';
  }
}

export class SearchIndexError extends SearchError {
  constructor(message: string) {
    super(`Index error: ${message}`);
    this.name = 'SearchIndexError';
  }
}

export class SearchQueryError extends SearchError {
  constructor(message: string) {
    super(`Query error: ${message}`);
    this.name = 'SearchQueryError';
  }
}
