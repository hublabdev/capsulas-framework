# Search Capsule

Full-text search with multiple providers (Algolia, Elasticsearch, Meilisearch, Typesense).

## Features

- Multiple search providers
- Full-text search with highlighting
- Faceted search and filtering
- Document indexing and deletion
- Pagination support
- Statistics tracking
- TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

### Algolia

```typescript
import { createSearchService } from '@capsulas/capsules/search';

const searchService = createSearchService({
  provider: 'algolia',
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'products'
});

await searchService.initialize();

// Search
const results = await searchService.search({
  query: 'laptop',
  hitsPerPage: 20,
  page: 1,
  filters: { category: 'electronics' }
});

console.log(results.hits);
```

### Elasticsearch

```typescript
const searchService = createSearchService({
  provider: 'elasticsearch',
  host: 'http://localhost:9200',
  indexName: 'products'
});

await searchService.initialize();
```

### Meilisearch

```typescript
const searchService = createSearchService({
  provider: 'meilisearch',
  host: 'http://localhost:7700',
  apiKey: 'YOUR_MASTER_KEY',
  indexName: 'products'
});

await searchService.initialize();
```

## API

### `searchService.search(query: SearchQuery): Promise<SearchResult>`

Search documents.

**Query:**
- `query` - Search string (required)
- `filters` - Filter conditions
- `facets` - Facets to compute
- `page` - Page number (default: 1)
- `hitsPerPage` - Results per page (default: 20, max: 1000)
- `attributesToRetrieve` - Attributes to return
- `attributesToHighlight` - Attributes to highlight

**Result:**
- `hits` - Array of search hits
- `totalHits` - Total number of results
- `page` - Current page
- `totalPages` - Total pages
- `processingTime` - Query time in ms
- `facets` - Computed facets

### `searchService.index(documents: SearchDocument[]): Promise<IndexOperation>`

Index documents.

### `searchService.delete(ids: string[]): Promise<IndexOperation>`

Delete documents by ID.

### `searchService.getStats(): SearchStats`

Get search statistics.

## Examples

### Index Products

```typescript
const products = [
  { id: '1', name: 'Laptop', category: 'electronics', price: 999 },
  { id: '2', name: 'Phone', category: 'electronics', price: 599 },
  { id: '3', name: 'Book', category: 'books', price: 19 }
];

const result = await searchService.index(products);
console.log(`Indexed ${result.indexedCount} products`);
```

### Faceted Search

```typescript
const results = await searchService.search({
  query: 'laptop',
  facets: ['category', 'brand'],
  filters: {
    price: { min: 500, max: 2000 }
  }
});

console.log(results.facets);
// { category: { electronics: 45 }, brand: { dell: 12, hp: 8 } }
```

### Pagination

```typescript
const page1 = await searchService.search({
  query: 'electronics',
  page: 1,
  hitsPerPage: 10
});

const page2 = await searchService.search({
  query: 'electronics',
  page: 2,
  hitsPerPage: 10
});
```

### Statistics

```typescript
const stats = searchService.getStats();
console.log(`Total searches: ${stats.totalSearches}`);
console.log(`Average latency: ${stats.averageLatency}ms`);
console.log(`Total indexed: ${stats.totalIndexed}`);
```

## Providers

### Algolia
- Blazing fast search-as-a-service
- Advanced relevance and typo tolerance
- [Documentation](https://www.algolia.com/doc/)

### Elasticsearch
- Open-source distributed search engine
- Powerful querying and analytics
- [Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

### Meilisearch
- Lightning-fast open-source search
- Easy to use and deploy
- [Documentation](https://docs.meilisearch.com/)

### Typesense
- Fast, typo-tolerant open-source search
- Easy setup and configuration
- [Documentation](https://typesense.org/docs/)

## License

MIT
