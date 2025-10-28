/**
 * Database Capsule - Service
 *
 * Main service class that orchestrates database operations
 * Follows the standard capsule pattern with initialize/execute/cleanup lifecycle
 */

import {
  DatabaseAdapter,
  DatabaseServiceConfig,
  DatabaseExecutionResult,
  DatabaseStats,
  Migration,
  MigrationStatus,
  MigrationRecord,
  Seeder,
  QueryResult,
  Transaction,
  TableSchema,
  QueryBuilder,
} from './types';
import { createDatabaseAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS, ERROR_MESSAGES } from './constants';
import {
  DatabaseError,
  ConnectionError,
  QueryError,
  MigrationError,
  SchemaError,
} from './errors';
import {
  validateConfig,
  validateTableName,
  retry,
  parseConnectionString,
} from './utils';

/**
 * Database Service
 *
 * Provides high-level database operations with:
 * - Connection management
 * - Query execution with retry logic
 * - Transaction support
 * - Migration system
 * - Schema management
 * - Statistics tracking
 */
export class DatabaseService {
  private adapter!: DatabaseAdapter;
  private config: Required<DatabaseServiceConfig>;
  private migrations: Map<string, Migration>;
  private seeders: Map<string, Seeder>;
  private stats: DatabaseStats;
  private initialized: boolean;

  /**
   * Create a new DatabaseService instance
   *
   * @param config - Database configuration
   */
  constructor(config: DatabaseServiceConfig) {
    // Merge with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      type: config.type,
    } as Required<DatabaseServiceConfig>;

    // Parse connection string if provided
    if (config.connectionString) {
      const parsed = parseConnectionString(config.connectionString);
      Object.assign(this.config, parsed);
    }

    // Validate configuration
    validateConfig(this.config);

    // Initialize collections
    this.migrations = new Map();
    this.seeders = new Map();
    this.stats = { ...INITIAL_STATS };
    this.initialized = false;
  }

  // ==========================================================================
  // LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Initialize the database service
   * Connects to database and optionally runs migrations/seeds
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new ConnectionError(ERROR_MESSAGES.ALREADY_CONNECTED);
    }

    try {
      // Create adapter
      this.adapter = createDatabaseAdapter(this.config);
      this.stats.connectionsCreated++;

      // Connect to database
      await retry(
        () => this.adapter.connect(this.config),
        this.config.retryAttempts,
        this.config.retryDelay,
        2,
        (error: any) => {
          // Retry on connection errors
          return error instanceof ConnectionError;
        }
      );

      this.stats.connectionsActive++;
      this.initialized = true;

      // Auto-migrate if configured
      if (this.config.autoMigrate) {
        await this.runMigrations();
      }

      // Auto-seed if configured
      if (this.config.autoSeed) {
        await this.runSeeders();
      }
    } catch (error: any) {
      this.stats.connectionsActive = 0;
      throw new ConnectionError(
        `Failed to initialize database: ${error.message}`,
        error
      );
    }
  }

  /**
   * Main execution method for the capsule
   * Executes a query or operation
   *
   * @param input - Query or operation to execute
   * @returns Execution result
   */
  async execute(input: {
    operation: 'query' | 'execute' | 'transaction' | 'migrate' | 'seed';
    sql?: string;
    params?: any[];
    data?: any;
    callback?: (trx: Transaction) => Promise<any>;
  }): Promise<DatabaseExecutionResult> {
    if (!this.initialized) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_CONNECTED,
        metadata: {
          queryTime: 0,
        },
      };
    }

    const startTime = Date.now();

    try {
      let result: any;

      switch (input.operation) {
        case 'query':
          if (!input.sql) throw new QueryError('SQL query is required');
          result = await this.query(input.sql, input.params);
          break;

        case 'execute':
          if (!input.sql) throw new QueryError('SQL statement is required');
          result = await this.executeSQL(input.sql, input.params);
          break;

        case 'transaction':
          if (!input.callback) throw new Error('Transaction callback is required');
          result = await this.transaction(input.callback);
          break;

        case 'migrate':
          result = await this.runMigrations();
          break;

        case 'seed':
          result = await this.runSeeders();
          break;

        default:
          throw new Error(`Unknown operation: ${input.operation}`);
      }

      const queryTime = Date.now() - startTime;
      this.updateStats(queryTime, false);

      return {
        success: true,
        data: result,
        metadata: {
          queryTime,
          rowCount: result?.rowCount,
          affectedRows: result?.affectedRows,
        },
      };
    } catch (error: any) {
      const queryTime = Date.now() - startTime;
      this.updateStats(queryTime, true);

      return {
        success: false,
        error: error.message,
        metadata: {
          queryTime,
        },
      };
    }
  }

  /**
   * Cleanup resources
   * Closes database connection
   */
  async cleanup(): Promise<void> {
    if (this.adapter && this.initialized) {
      await this.adapter.disconnect();
      this.stats.connectionsActive = Math.max(0, this.stats.connectionsActive - 1);
      this.initialized = false;
    }
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Execute a SELECT query
   *
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    this.ensureConnected();

    if (this.config.logQueries) {
      console.log('[Database] Query:', sql, params);
    }

    const startTime = Date.now();

    try {
      const result = await retry(
        () => this.adapter.query<T>(sql, params),
        this.config.retryAttempts,
        this.config.retryDelay
      );

      this.updateStats(Date.now() - startTime, false);
      return result;
    } catch (error: any) {
      this.updateStats(Date.now() - startTime, true);
      throw new QueryError(`Query failed: ${error.message}`, sql, error);
    }
  }

  /**
   * Execute an INSERT/UPDATE/DELETE statement
   *
   * @param sql - SQL statement string
   * @param params - Statement parameters
   * @returns Execution result
   */
  async executeSQL(sql: string, params?: any[]): Promise<QueryResult> {
    this.ensureConnected();

    if (this.config.logQueries) {
      console.log('[Database] Execute:', sql, params);
    }

    const startTime = Date.now();

    try {
      const result = await retry(
        () => this.adapter.execute(sql, params),
        this.config.retryAttempts,
        this.config.retryDelay
      );

      this.updateStats(Date.now() - startTime, false);
      return result;
    } catch (error: any) {
      this.updateStats(Date.now() - startTime, true);
      throw new QueryError(`Execute failed: ${error.message}`, sql, error);
    }
  }

  /**
   * Get query builder for table
   *
   * @param tableName - Table name
   * @returns Query builder
   */
  table<T = any>(tableName: string): QueryBuilder<T> {
    this.ensureConnected();
    validateTableName(tableName);
    return this.adapter.queryBuilder<T>(tableName);
  }

  /**
   * Execute raw SQL query
   *
   * @param sql - Raw SQL string
   * @param params - Query parameters
   * @returns Query result
   */
  async raw(sql: string, params?: any[]): Promise<QueryResult> {
    this.ensureConnected();
    return this.adapter.raw(sql, params);
  }

  // ==========================================================================
  // TRANSACTION METHODS
  // ==========================================================================

  /**
   * Execute queries in a transaction
   *
   * @param callback - Transaction callback
   * @returns Transaction result
   */
  async transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T> {
    this.ensureConnected();
    this.stats.transactionsStarted++;

    const trx = await this.adapter.beginTransaction();

    try {
      const result = await callback(trx);
      await trx.commit();
      this.stats.transactionsCommitted++;
      return result;
    } catch (error) {
      await trx.rollback();
      this.stats.transactionsRolledBack++;
      throw error;
    }
  }

  // ==========================================================================
  // SCHEMA METHODS
  // ==========================================================================

  /**
   * Create a new table
   *
   * @param schema - Table schema
   */
  async createTable(schema: TableSchema): Promise<void> {
    this.ensureConnected();
    validateTableName(schema.name);

    try {
      await this.adapter.createTable(schema);
    } catch (error: any) {
      throw new SchemaError(
        `Failed to create table ${schema.name}: ${error.message}`,
        schema.name,
        error
      );
    }
  }

  /**
   * Drop a table
   *
   * @param tableName - Table name
   */
  async dropTable(tableName: string): Promise<void> {
    this.ensureConnected();
    validateTableName(tableName);

    try {
      await this.adapter.dropTable(tableName);
    } catch (error: any) {
      throw new SchemaError(
        `Failed to drop table ${tableName}: ${error.message}`,
        tableName,
        error
      );
    }
  }

  /**
   * Check if table exists
   *
   * @param tableName - Table name
   * @returns True if table exists
   */
  async hasTable(tableName: string): Promise<boolean> {
    this.ensureConnected();
    return this.adapter.hasTable(tableName);
  }

  /**
   * Get list of all tables
   *
   * @returns Array of table names
   */
  async getTables(): Promise<string[]> {
    this.ensureConnected();
    return this.adapter.getTables();
  }

  // ==========================================================================
  // MIGRATION METHODS
  // ==========================================================================

  /**
   * Register a migration
   *
   * @param migration - Migration definition
   */
  registerMigration(migration: Migration): void {
    this.migrations.set(migration.id, migration);
  }

  /**
   * Get migration status
   *
   * @returns Migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    await this.ensureMigrationsTable();

    const executed = await this.getExecutedMigrations();
    const executedIds = new Set(executed.map(m => m.id));

    const pending = Array.from(this.migrations.values())
      .filter(m => !executedIds.has(m.id))
      .sort((a, b) => a.timestamp - b.timestamp);

    const lastBatch =
      executed.length > 0 ? Math.max(...executed.map(m => m.batch)) : 0;

    return { pending, executed, lastBatch };
  }

  /**
   * Run pending migrations
   */
  async runMigrations(): Promise<void> {
    const status = await this.getMigrationStatus();

    if (status.pending.length === 0) {
      if (this.config.logQueries) {
        console.log('[Migrations] No pending migrations');
      }
      return;
    }

    const batch = status.lastBatch + 1;

    for (const migration of status.pending) {
      if (this.config.logQueries) {
        console.log(`[Migrations] Running: ${migration.name}`);
      }

      try {
        await migration.up(this.adapter);

        await this.executeSQL(
          `INSERT INTO ${this.config.migrationsTable} (id, name, executed_at, batch) VALUES (?, ?, ?, ?)`,
          [migration.id, migration.name, Date.now(), batch]
        );

        this.stats.migrationsRun++;

        if (this.config.logQueries) {
          console.log(`[Migrations] ✓ ${migration.name}`);
        }
      } catch (error: any) {
        throw new MigrationError(
          `Migration ${migration.name} failed: ${error.message}`,
          migration.id,
          error
        );
      }
    }
  }

  /**
   * Rollback migrations
   *
   * @param steps - Number of batches to rollback
   */
  async rollbackMigrations(steps: number = 1): Promise<void> {
    await this.ensureMigrationsTable();

    const executed = await this.getExecutedMigrations();
    if (executed.length === 0) return;

    const lastBatch = Math.max(...executed.map(m => m.batch));
    const toRollback = executed
      .filter(m => m.batch >= lastBatch - steps + 1)
      .reverse();

    for (const record of toRollback) {
      const migration = this.migrations.get(record.id);
      if (!migration) {
        console.warn(`[Migrations] Migration ${record.name} not found`);
        continue;
      }

      if (this.config.logQueries) {
        console.log(`[Migrations] Rolling back: ${migration.name}`);
      }

      try {
        await migration.down(this.adapter);

        await this.executeSQL(
          `DELETE FROM ${this.config.migrationsTable} WHERE id = ?`,
          [record.id]
        );

        if (this.config.logQueries) {
          console.log(`[Migrations] ✓ Rolled back ${migration.name}`);
        }
      } catch (error: any) {
        throw new MigrationError(
          `Rollback of ${migration.name} failed: ${error.message}`,
          migration.id,
          error
        );
      }
    }
  }

  private async ensureMigrationsTable(): Promise<void> {
    const hasTable = await this.adapter.hasTable(this.config.migrationsTable);

    if (!hasTable) {
      await this.adapter.createTable({
        name: this.config.migrationsTable,
        columns: [
          { name: 'id', type: 'string', length: 255, primary: true },
          { name: 'name', type: 'string', length: 255 },
          { name: 'executed_at', type: 'bigint' },
          { name: 'batch', type: 'integer' },
        ],
      });
    }
  }

  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const result = await this.query<MigrationRecord>(
      `SELECT * FROM ${this.config.migrationsTable} ORDER BY executed_at ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      executedAt: Number(row.executed_at || row.executedAt),
      batch: Number(row.batch),
    }));
  }

  // ==========================================================================
  // SEEDER METHODS
  // ==========================================================================

  /**
   * Register a seeder
   *
   * @param seeder - Seeder definition
   */
  registerSeeder(seeder: Seeder): void {
    this.seeders.set(seeder.name, seeder);
  }

  /**
   * Run all registered seeders
   */
  async runSeeders(): Promise<void> {
    for (const seeder of this.seeders.values()) {
      if (this.config.logQueries) {
        console.log(`[Seeders] Running: ${seeder.name}`);
      }

      await seeder.run(this.adapter);
      this.stats.seedersRun++;

      if (this.config.logQueries) {
        console.log(`[Seeders] ✓ ${seeder.name}`);
      }
    }
  }

  // ==========================================================================
  // STATISTICS METHODS
  // ==========================================================================

  /**
   * Get database statistics
   *
   * @returns Database stats
   */
  getStats(): DatabaseStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { ...INITIAL_STATS };
  }

  private updateStats(queryTime: number, failed: boolean): void {
    if (failed) {
      this.stats.queriesFailed++;
    } else {
      this.stats.queriesExecuted++;
      this.stats.totalQueryTime += queryTime;
      this.stats.averageQueryTime =
        this.stats.totalQueryTime / this.stats.queriesExecuted;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if database is connected
   *
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.initialized && this.adapter?.isConnected();
  }

  /**
   * Ping database to check connection
   *
   * @returns True if connection is alive
   */
  async ping(): Promise<boolean> {
    if (!this.initialized) return false;
    return this.adapter.ping();
  }

  /**
   * Get the underlying adapter
   *
   * @returns Database adapter
   */
  getAdapter(): DatabaseAdapter {
    return this.adapter;
  }

  private ensureConnected(): void {
    if (!this.initialized || !this.adapter) {
      throw new ConnectionError(ERROR_MESSAGES.NOT_CONNECTED);
    }
  }
}

/**
 * Factory function to create DatabaseService
 *
 * @param config - Database configuration
 * @returns DatabaseService instance
 */
export function createDatabaseService(config: DatabaseServiceConfig): DatabaseService {
  return new DatabaseService(config);
}
