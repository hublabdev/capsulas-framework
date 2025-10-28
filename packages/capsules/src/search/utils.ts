/**
 * Search Capsule - Utils
 */

import { SearchQuery, SearchDocument } from './types';
import { SearchQueryError } from './errors';
import { DEFAULT_HITS_PER_PAGE, MAX_HITS_PER_PAGE, DEFAULT_PAGE } from './constants';

export function validateQuery(query: SearchQuery): void {
  if (!query.query || query.query.trim().length === 0) {
    throw new SearchQueryError('Query string cannot be empty');
  }

  if (query.hitsPerPage && query.hitsPerPage > MAX_HITS_PER_PAGE) {
    throw new SearchQueryError(`hitsPerPage cannot exceed ${MAX_HITS_PER_PAGE}`);
  }

  if (query.page && query.page < 1) {
    throw new SearchQueryError('Page number must be >= 1');
  }
}

export function normalizeQuery(query: SearchQuery): SearchQuery {
  return {
    ...query,
    hitsPerPage: query.hitsPerPage || DEFAULT_HITS_PER_PAGE,
    page: query.page || DEFAULT_PAGE
  };
}

export function calculatePagination(total: number, page: number, hitsPerPage: number) {
  const totalPages = Math.ceil(total / hitsPerPage);
  return {
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

export function highlightText(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<em>$1</em>');
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
