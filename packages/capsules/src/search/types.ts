/**
 * Search Capsule - Types
 * Full-text search with multiple providers
 */

export type SearchProvider = 'algolia' | 'elasticsearch' | 'meilisearch' | 'typesense';

export interface SearchConfig {
  provider: SearchProvider;
  apiKey?: string;
  appId?: string; // Algolia
  host?: string; // Elasticsearch, Meilisearch, Typesense
  indexName?: string;
}

export interface SearchDocument {
  id: string;
  [key: string]: any;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  facets?: string[];
  page?: number;
  hitsPerPage?: number;
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
}

export interface SearchHit {
  id: string;
  document: SearchDocument;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResult {
  hits: SearchHit[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTime: number;
  query: string;
  facets?: Record<string, Record<string, number>>;
}

export interface IndexOperation {
  success: boolean;
  indexedCount: number;
  failedCount: number;
  errors?: string[];
}

export interface SearchStats {
  totalSearches: number;
  totalIndexed: number;
  totalDeleted: number;
  averageLatency: number;
  lastSearch?: Date;
}
