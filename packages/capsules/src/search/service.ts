/**
 * Search Capsule - Service
 */

import { SearchConfig, SearchQuery, SearchResult, SearchDocument, IndexOperation, SearchStats, SearchProvider } from './types';
import { SearchError } from './errors';
import { createAdapter, SearchAdapter } from './adapters';
import { validateQuery, normalizeQuery } from './utils';
import { DEFAULT_SEARCH_CONFIG, INITIAL_STATS } from './constants';

export class SearchService {
  private config: SearchConfig;
  private adapter: SearchAdapter | null = null;
  private initialized: boolean = false;
  private stats: SearchStats;

  constructor(config: SearchConfig) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.stats = { ...INITIAL_STATS };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.adapter = createAdapter(this.config);
    await this.adapter.initialize();
    this.initialized = true;
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    if (!this.initialized || !this.adapter) {
      throw new SearchError('Service not initialized. Call initialize() first.');
    }

    validateQuery(query);
    const normalizedQuery = normalizeQuery(query);

    const startTime = Date.now();

    try {
      const result = await this.adapter.search(normalizedQuery);
      const latency = Date.now() - startTime;

      this.updateSearchStats(latency);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async index(documents: SearchDocument[]): Promise<IndexOperation> {
    if (!this.initialized || !this.adapter) {
      throw new SearchError('Service not initialized. Call initialize() first.');
    }

    if (!documents || documents.length === 0) {
      throw new SearchError('No documents to index');
    }

    try {
      const result = await this.adapter.index(documents);
      this.stats.totalIndexed += result.indexedCount;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(ids: string[]): Promise<IndexOperation> {
    if (!this.initialized || !this.adapter) {
      throw new SearchError('Service not initialized. Call initialize() first.');
    }

    if (!ids || ids.length === 0) {
      throw new SearchError('No document IDs provided');
    }

    try {
      const result = await this.adapter.delete(ids);
      this.stats.totalDeleted += ids.length;
      return result;
    } catch (error) {
      throw error;
    }
  }

  getStats(): SearchStats {
    return { ...this.stats };
  }

  getProvider(): SearchProvider {
    if (!this.adapter) {
      throw new SearchError('Service not initialized');
    }
    return this.adapter.getProvider();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private updateSearchStats(latency: number): void {
    this.stats.totalSearches++;
    this.stats.averageLatency =
      (this.stats.averageLatency * (this.stats.totalSearches - 1) + latency) / this.stats.totalSearches;
    this.stats.lastSearch = new Date();
  }
}
