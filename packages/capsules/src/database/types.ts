/**
 * Database Capsule - Types
 *
 * TypeScript type definitions for the database capsule
 */

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type DatabaseType = 'sqlite' | 'postgres' | 'mysql' | 'sqlserver' | 'mongodb';
export type DatabaseProvider = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite' | 'supabase' | 'firebase';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface DatabaseConfig {
  type: DatabaseType;
  provider?: DatabaseProvider;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  filename?: string;
  inMemory?: boolean;
  ssl?: boolean;
  poolSize?: number;
  poolMin?: number;
  poolMax?: number;
  timeout?: number;
  debug?: boolean;
}

export interface DatabaseServiceConfig extends DatabaseConfig {
  // Connection pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;

  // Database options
  timezone?: string;
  charset?: string;

  // Migrations
  migrationsPath?: string;
  migrationsTable?: string;
  autoMigrate?: boolean;
  autoSeed?: boolean;

  // Logging
  logQueries?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  // Service options
  retryAttempts?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheMaxSize?: number;
  enableStatistics?: boolean;
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: Record<string, 'asc' | 'desc'>;
  fields?: string[];
  timeout?: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields?: string[];
  affectedRows?: number;
  insertId?: number | string;
}

export interface WhereClause {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';
  value?: any;
  logic?: 'AND' | 'OR';
}

export interface Transaction {
  id: string;
  queries: Array<{ sql: string; params: any[] }>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  execute: (sql: string, params?: any[]) => Promise<QueryResult>;
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
}

// ============================================================================
// SCHEMA TYPES
// ============================================================================

export interface Schema {
  name: string;
  fields: SchemaField[];
  indexes?: SchemaIndex[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  unique?: boolean;
  default?: any;
}

export interface SchemaIndex {
  fields: string[];
  unique?: boolean;
  name?: string;
}

export type ColumnType =
  | 'string'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'float'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'json'
  | 'blob';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  primary?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  comment?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
  primaryKey?: string | string[];
  foreignKeys?: ForeignKeyDefinition[];
  comment?: string;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gist' | 'gin';
}

export interface ForeignKeyDefinition {
  name?: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface TableChange {
  type: 'add_column' | 'drop_column' | 'rename_column' | 'modify_column' | 'add_index' | 'drop_index';
  column?: ColumnDefinition;
  oldName?: string;
  newName?: string;
  indexName?: string;
}

// ============================================================================
// MIGRATION TYPES
// ============================================================================

export interface Migration {
  id: string;
  name: string;
  timestamp: number;
  up: (adapter: DatabaseAdapter) => Promise<void>;
  down: (adapter: DatabaseAdapter) => Promise<void>;
}

export interface MigrationRecord {
  id: string;
  name: string;
  batch: number;
  executedAt: number;
  executed_at?: number; // For database compatibility
}

export interface MigrationStatus {
  pending: Migration[];
  executed: MigrationRecord[];
  lastBatch: number;
}

export interface Seeder {
  name: string;
  run: (adapter: DatabaseAdapter) => Promise<void>;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface DatabaseStats {
  totalConnections?: number;
  activeConnections?: number;
  totalQueries?: number;
  failedQueries?: number;
  avgQueryTime?: number;
  errors?: number;
  queriesExecuted: number;
  queriesFailed: number;
  totalQueryTime: number;
  averageQueryTime: number;
  connectionsCreated: number;
  connectionsActive: number;
  transactionsStarted: number;
  transactionsCommitted: number;
  transactionsRolledBack: number;
  migrationsRun: number;
  seedersRun: number;
}

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

export interface DatabaseAdapter {
  name: string;
  type: DatabaseType;

  // Connection management
  connect(config: DatabaseConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ping(): Promise<boolean>;

  // Query execution
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[]): Promise<QueryResult>;

  // Transactions
  beginTransaction(): Promise<Transaction>;

  // Schema operations
  createTable(schema: TableSchema): Promise<void>;
  dropTable(tableName: string, ifExists?: boolean): Promise<void>;
  alterTable(tableName: string, changes: TableChange[]): Promise<void>;
  hasTable(tableName: string): Promise<boolean>;
  getTables(): Promise<string[]>;
  getTableSchema?(tableName: string): Promise<TableSchema>;
  getColumns(tableName: string): Promise<ColumnDefinition[]>;

  // Index operations
  createIndex(tableName: string, index: IndexDefinition): Promise<void>;
  dropIndex(tableName: string, indexName: string): Promise<void>;

  // Utility operations
  truncateTable?(tableName: string): Promise<void>;
  raw(sql: string, params?: any[]): Promise<QueryResult>;
  queryBuilder<T = any>(tableName?: string): QueryBuilder<T>;

  // Internal helper methods (implementation-specific)
  _getColumnType(column: ColumnDefinition): string;
  _parseColumnType(sqlType: string): any;
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

export interface DatabaseExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    queryTime: number;
    rowCount?: number;
    affectedRows?: number;
  };
}

// ============================================================================
// QUERY BUILDER (Future)
// ============================================================================

export interface QueryBuilder<T = any> {
  select(...columns: string[]): QueryBuilder<T>;
  from(table: string): QueryBuilder<T>;
  where(column: string, operator: string, value: any): QueryBuilder<T>;
  andWhere(column: string, operator: string, value: any): QueryBuilder<T>;
  orWhere(column: string, operator: string, value: any): QueryBuilder<T>;
  join(table: string, on: string): QueryBuilder<T>;
  leftJoin(table: string, on: string): QueryBuilder<T>;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): QueryBuilder<T>;
  groupBy(...columns: string[]): QueryBuilder<T>;
  having(condition: string): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  get(): Promise<T[]>;
  first(): Promise<T | null>;
  count(): Promise<number>;
  insert(data: Partial<T>): Promise<number | string>;
  update(data: Partial<T>): Promise<number>;
  delete(): Promise<number>;
  toSQL(): { sql: string; params: any[] };
}
