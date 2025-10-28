import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, createDatabaseService } from '../service';
import {
  DatabaseError,
  ConnectionError,
  QueryError,
  SchemaError,
  ValidationError,
  MigrationError,
} from '../errors';
import {
  validateConfig,
  validateTableName,
  validateColumnName,
  escapeIdentifier,
  buildInsertSQL,
  buildUpdateSQL,
  buildDeleteSQL,
} from '../utils';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    service = createDatabaseService({
      type: 'sqlite',
      inMemory: true,
      logQueries: false,
    });
    await service.initialize();
  });

  afterEach(async () => {
    await service.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(true);
    });

    it('should throw error when already initialized', async () => {
      await expect(service.initialize()).rejects.toThrow(ConnectionError);
    });

    it('should throw error with invalid database type', async () => {
      expect(() =>
        createDatabaseService({
          type: 'invalid' as any,
        })
      ).toThrow(ValidationError);
    });

    it('should throw error when SQLite lacks filename or inMemory', () => {
      expect(() =>
        createDatabaseService({
          type: 'sqlite',
        })
      ).toThrow(ValidationError);
    });

    it('should create service with filename', () => {
      const fileService = createDatabaseService({
        type: 'sqlite',
        filename: './test.db',
      });
      expect(fileService).toBeDefined();
    });

    it('should track connection in statistics', () => {
      const stats = service.getStats();
      expect(stats.connectionsCreated).toBe(1);
      expect(stats.connectionsActive).toBe(1);
    });
  });

  describe('Connection Management', () => {
    it('should connect and disconnect', async () => {
      expect(service.isConnected()).toBe(true);
      await service.cleanup();
      expect(service.isConnected()).toBe(false);
    });

    it('should ping database successfully', async () => {
      const result = await service.ping();
      expect(result).toBe(true);
    });

    it('should return false when pinging disconnected database', async () => {
      await service.cleanup();
      const result = await service.ping();
      expect(result).toBe(false);
    });

    it('should throw error when querying disconnected database', async () => {
      await service.cleanup();
      await expect(service.query('SELECT 1')).rejects.toThrow(ConnectionError);
    });

    it('should update connection statistics on cleanup', async () => {
      const statsBefore = service.getStats();
      expect(statsBefore.connectionsActive).toBe(1);

      await service.cleanup();

      const statsAfter = service.getStats();
      expect(statsAfter.connectionsActive).toBe(0);
    });
  });

  describe('Query Operations', () => {
    it('should execute SELECT query', async () => {
      const result = await service.query('SELECT 1 as value');
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].value).toBe(1);
    });

    it('should execute query with parameters', async () => {
      await service.executeSQL(`
        CREATE TABLE test_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          age INTEGER
        )
      `);

      await service.executeSQL('INSERT INTO test_users (name, age) VALUES (?, ?)', [
        'John',
        30,
      ]);

      const result = await service.query('SELECT * FROM test_users WHERE name = ?', [
        'John',
      ]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('John');
      expect(result.rows[0].age).toBe(30);
    });

    it('should execute INSERT statement', async () => {
      await service.executeSQL(`
        CREATE TABLE test_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL
        )
      `);

      const result = await service.executeSQL(
        'INSERT INTO test_products (name, price) VALUES (?, ?)',
        ['Product A', 19.99]
      );

      expect(result).toBeDefined();
      expect(result.affectedRows).toBe(1);
      expect(result.insertId).toBeDefined();
    });

    it('should execute UPDATE statement', async () => {
      await service.executeSQL(`
        CREATE TABLE test_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          count INTEGER
        )
      `);

      await service.executeSQL('INSERT INTO test_items (name, count) VALUES (?, ?)', [
        'Item',
        5,
      ]);
      const result = await service.executeSQL(
        'UPDATE test_items SET count = ? WHERE name = ?',
        [10, 'Item']
      );

      expect(result.affectedRows).toBe(1);
    });

    it('should execute DELETE statement', async () => {
      await service.executeSQL(`
        CREATE TABLE test_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        )
      `);

      await service.executeSQL('INSERT INTO test_records (name) VALUES (?)', ['Record']);
      const result = await service.executeSQL('DELETE FROM test_records WHERE name = ?', [
        'Record',
      ]);

      expect(result.affectedRows).toBe(1);
    });

    it('should handle invalid SQL gracefully', async () => {
      await expect(service.query('INVALID SQL QUERY')).rejects.toThrow(QueryError);
    });

    it('should track query statistics', async () => {
      await service.query('SELECT 1');
      await service.query('SELECT 2');

      const stats = service.getStats();
      expect(stats.queriesExecuted).toBe(2);
      expect(stats.totalQueryTime).toBeGreaterThan(0);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
    });

    it('should track failed queries in statistics', async () => {
      try {
        await service.query('INVALID SQL');
      } catch {
        // Expected error
      }

      const stats = service.getStats();
      expect(stats.queriesFailed).toBe(1);
    });
  });

  describe('Transaction Support', () => {
    beforeEach(async () => {
      await service.executeSQL(`
        CREATE TABLE test_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          balance REAL DEFAULT 0
        )
      `);
    });

    it('should commit successful transaction', async () => {
      await service.transaction(async trx => {
        await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
          'Alice',
          100,
        ]);
        await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
          'Bob',
          50,
        ]);
      });

      const result = await service.query('SELECT * FROM test_accounts');
      expect(result.rows.length).toBe(2);
    });

    it('should rollback failed transaction', async () => {
      try {
        await service.transaction(async trx => {
          await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
            'Alice',
            100,
          ]);
          throw new Error('Simulated error');
        });
      } catch {
        // Expected error
      }

      const result = await service.query('SELECT * FROM test_accounts');
      expect(result.rows.length).toBe(0);
    });

    it('should track transaction statistics', async () => {
      await service.transaction(async trx => {
        await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
          'Alice',
          100,
        ]);
      });

      const stats = service.getStats();
      expect(stats.transactionsStarted).toBe(1);
      expect(stats.transactionsCommitted).toBe(1);
      expect(stats.transactionsRolledBack).toBe(0);
    });

    it('should track rollback statistics', async () => {
      try {
        await service.transaction(async trx => {
          await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
            'Alice',
            100,
          ]);
          throw new Error('Force rollback');
        });
      } catch {
        // Expected error
      }

      const stats = service.getStats();
      expect(stats.transactionsStarted).toBe(1);
      expect(stats.transactionsCommitted).toBe(0);
      expect(stats.transactionsRolledBack).toBe(1);
    });

    it('should allow queries within transaction', async () => {
      const result = await service.transaction(async trx => {
        await trx.execute('INSERT INTO test_accounts (name, balance) VALUES (?, ?)', [
          'Alice',
          100,
        ]);
        const rows = await trx.query('SELECT * FROM test_accounts');
        return rows;
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('Schema Operations', () => {
    it('should create table with schema', async () => {
      await service.createTable({
        name: 'users',
        columns: [
          { name: 'id', type: 'integer', primary: true, autoIncrement: true },
          { name: 'name', type: 'string', length: 100, nullable: false },
          { name: 'email', type: 'string', length: 255, unique: true },
          { name: 'age', type: 'integer', nullable: true },
        ],
      });

      const hasTable = await service.hasTable('users');
      expect(hasTable).toBe(true);
    });

    it('should drop table', async () => {
      await service.createTable({
        name: 'temp_table',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });

      expect(await service.hasTable('temp_table')).toBe(true);

      await service.dropTable('temp_table');

      expect(await service.hasTable('temp_table')).toBe(false);
    });

    it('should check if table exists', async () => {
      await service.createTable({
        name: 'existing_table',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });

      expect(await service.hasTable('existing_table')).toBe(true);
      expect(await service.hasTable('non_existing_table')).toBe(false);
    });

    it('should get list of tables', async () => {
      await service.createTable({
        name: 'table1',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });
      await service.createTable({
        name: 'table2',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });

      const tables = await service.getTables();
      expect(tables).toContain('table1');
      expect(tables).toContain('table2');
    });

    it('should throw error with invalid table name', async () => {
      expect(() => validateTableName('')).toThrow(ValidationError);
      expect(() => validateTableName('123invalid')).toThrow(ValidationError);
      expect(() => validateTableName('table-name')).toThrow(ValidationError);
      expect(() => validateTableName('SELECT')).toThrow(ValidationError);
    });

    it('should throw error when creating table with invalid name', async () => {
      await expect(
        service.createTable({
          name: '123invalid',
          columns: [{ name: 'id', type: 'integer' }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error when dropping invalid table name', async () => {
      await expect(service.dropTable('123invalid')).rejects.toThrow(ValidationError);
    });
  });

  describe('Migration Support', () => {
    it('should register migration', () => {
      service.registerMigration({
        id: 'migration_001',
        name: 'Create users table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE users');
        },
      });

      // Migration registered successfully if no error thrown
      expect(true).toBe(true);
    });

    it('should run pending migrations', async () => {
      service.registerMigration({
        id: 'migration_002',
        name: 'Create products table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              price REAL
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE products');
        },
      });

      await service.runMigrations();

      const hasTable = await service.hasTable('products');
      expect(hasTable).toBe(true);
    });

    it('should track migration statistics', async () => {
      service.registerMigration({
        id: 'migration_003',
        name: 'Create categories table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE categories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE categories');
        },
      });

      await service.runMigrations();

      const stats = service.getStats();
      expect(stats.migrationsRun).toBe(1);
    });

    it('should get migration status', async () => {
      service.registerMigration({
        id: 'migration_004',
        name: 'Create orders table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE orders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              total REAL
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE orders');
        },
      });

      const statusBefore = await service.getMigrationStatus();
      expect(statusBefore.pending.length).toBe(1);
      expect(statusBefore.executed.length).toBe(0);

      await service.runMigrations();

      const statusAfter = await service.getMigrationStatus();
      expect(statusAfter.pending.length).toBe(0);
      expect(statusAfter.executed.length).toBe(1);
    });

    it('should not run migrations twice', async () => {
      service.registerMigration({
        id: 'migration_005',
        name: 'Create tags table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE tags (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE tags');
        },
      });

      await service.runMigrations();
      const statsBefore = service.getStats();

      // Run again - should not execute
      await service.runMigrations();
      const statsAfter = service.getStats();

      expect(statsAfter.migrationsRun).toBe(statsBefore.migrationsRun);
    });

    it('should rollback migrations', async () => {
      service.registerMigration({
        id: 'migration_006',
        name: 'Create comments table',
        timestamp: Date.now(),
        async up(adapter) {
          await adapter.execute(`
            CREATE TABLE comments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              text TEXT
            )
          `);
        },
        async down(adapter) {
          await adapter.execute('DROP TABLE comments');
        },
      });

      await service.runMigrations();
      expect(await service.hasTable('comments')).toBe(true);

      await service.rollbackMigrations(1);
      expect(await service.hasTable('comments')).toBe(false);
    });

    it('should throw error when migration fails', async () => {
      service.registerMigration({
        id: 'migration_007',
        name: 'Failing migration',
        timestamp: Date.now(),
        async up() {
          throw new Error('Migration failed');
        },
        async down() {
          // No-op
        },
      });

      await expect(service.runMigrations()).rejects.toThrow(MigrationError);
    });
  });

  describe('Seeder Support', () => {
    beforeEach(async () => {
      await service.createTable({
        name: 'sample_data',
        columns: [
          { name: 'id', type: 'integer', primary: true, autoIncrement: true },
          { name: 'value', type: 'string', length: 100 },
        ],
      });
    });

    it('should register seeder', () => {
      service.registerSeeder({
        name: 'SampleDataSeeder',
        async run(adapter) {
          await adapter.execute(
            'INSERT INTO sample_data (value) VALUES (?)',
            ['Sample']
          );
        },
      });

      // Seeder registered successfully if no error thrown
      expect(true).toBe(true);
    });

    it('should run seeders', async () => {
      service.registerSeeder({
        name: 'TestDataSeeder',
        async run(adapter) {
          await adapter.execute(
            'INSERT INTO sample_data (value) VALUES (?)',
            ['Test Data']
          );
        },
      });

      await service.runSeeders();

      const result = await service.query('SELECT * FROM sample_data');
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].value).toBe('Test Data');
    });

    it('should track seeder statistics', async () => {
      service.registerSeeder({
        name: 'StatsSeeder',
        async run(adapter) {
          await adapter.execute(
            'INSERT INTO sample_data (value) VALUES (?)',
            ['Stats']
          );
        },
      });

      await service.runSeeders();

      const stats = service.getStats();
      expect(stats.seedersRun).toBe(1);
    });

    it('should run multiple seeders', async () => {
      service.registerSeeder({
        name: 'FirstSeeder',
        async run(adapter) {
          await adapter.execute('INSERT INTO sample_data (value) VALUES (?)', ['First']);
        },
      });

      service.registerSeeder({
        name: 'SecondSeeder',
        async run(adapter) {
          await adapter.execute('INSERT INTO sample_data (value) VALUES (?)', ['Second']);
        },
      });

      await service.runSeeders();

      const result = await service.query('SELECT * FROM sample_data');
      expect(result.rows.length).toBe(2);

      const stats = service.getStats();
      expect(stats.seedersRun).toBe(2);
    });
  });

  describe('Execute Method', () => {
    it('should execute query operation', async () => {
      const result = await service.execute({
        operation: 'query',
        sql: 'SELECT 1 as value',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.queryTime).toBeGreaterThanOrEqual(0);
    });

    it('should execute execute operation', async () => {
      await service.executeSQL(`CREATE TABLE test_exec (id INTEGER PRIMARY KEY)`);

      const result = await service.execute({
        operation: 'execute',
        sql: 'INSERT INTO test_exec (id) VALUES (1)',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.affectedRows).toBe(1);
    });

    it('should execute transaction operation', async () => {
      await service.executeSQL(`CREATE TABLE test_txn (id INTEGER PRIMARY KEY, value TEXT)`);

      const result = await service.execute({
        operation: 'transaction',
        callback: async trx => {
          await trx.execute('INSERT INTO test_txn (id, value) VALUES (?, ?)', [1, 'A']);
          await trx.execute('INSERT INTO test_txn (id, value) VALUES (?, ?)', [2, 'B']);
          return { inserted: 2 };
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ inserted: 2 });
    });

    it('should return error for invalid operation', async () => {
      const result = await service.execute({
        operation: 'invalid' as any,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when not connected', async () => {
      await service.cleanup();

      const result = await service.execute({
        operation: 'query',
        sql: 'SELECT 1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not connected');
    });

    it('should include query time in metadata', async () => {
      const result = await service.execute({
        operation: 'query',
        sql: 'SELECT 1',
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.queryTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics', () => {
    it('should get statistics', () => {
      const stats = service.getStats();
      expect(stats).toBeDefined();
      expect(stats.queriesExecuted).toBeGreaterThanOrEqual(0);
      expect(stats.connectionsCreated).toBe(1);
      expect(stats.connectionsActive).toBe(1);
    });

    it('should reset statistics', async () => {
      await service.query('SELECT 1');
      await service.query('SELECT 2');

      service.resetStats();

      const stats = service.getStats();
      expect(stats.queriesExecuted).toBe(0);
      expect(stats.totalQueryTime).toBe(0);
    });

    it('should calculate average query time', async () => {
      await service.query('SELECT 1');
      await service.query('SELECT 2');
      await service.query('SELECT 3');

      const stats = service.getStats();
      expect(stats.averageQueryTime).toBeGreaterThan(0);
      expect(stats.averageQueryTime).toBe(stats.totalQueryTime / stats.queriesExecuted);
    });

    it('should track all operation types', async () => {
      await service.createTable({
        name: 'stats_test',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });

      await service.transaction(async trx => {
        await trx.execute('INSERT INTO stats_test (id) VALUES (1)');
      });

      service.registerMigration({
        id: 'stats_migration',
        name: 'Stats Migration',
        timestamp: Date.now(),
        async up() {},
        async down() {},
      });
      await service.runMigrations();

      service.registerSeeder({
        name: 'StatsSeeder',
        async run() {},
      });
      await service.runSeeders();

      const stats = service.getStats();
      expect(stats.queriesExecuted).toBeGreaterThan(0);
      expect(stats.transactionsCommitted).toBe(1);
      expect(stats.migrationsRun).toBe(1);
      expect(stats.seedersRun).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const badService = createDatabaseService({
        type: 'sqlite',
        filename: '/invalid/path/database.db',
      });

      await expect(badService.initialize()).rejects.toThrow(ConnectionError);
    });

    it('should handle query errors with invalid SQL', async () => {
      await expect(service.query('SELECT FROM WHERE')).rejects.toThrow(QueryError);
    });

    it('should handle schema errors with duplicate tables', async () => {
      await service.createTable({
        name: 'duplicate_test',
        columns: [{ name: 'id', type: 'integer', primary: true }],
      });

      await expect(
        service.createTable({
          name: 'duplicate_test',
          columns: [{ name: 'id', type: 'integer', primary: true }],
        })
      ).rejects.toThrow();
    });

    it('should handle errors in transactions', async () => {
      await service.executeSQL(`
        CREATE TABLE error_test (id INTEGER PRIMARY KEY, value TEXT NOT NULL)
      `);

      await expect(
        service.transaction(async trx => {
          await trx.execute('INSERT INTO error_test (id, value) VALUES (?, ?)', [
            1,
            'Valid',
          ]);
          // This should fail due to NOT NULL constraint
          await trx.execute('INSERT INTO error_test (id) VALUES (?)', [2]);
        })
      ).rejects.toThrow();

      // Verify rollback occurred
      const result = await service.query('SELECT * FROM error_test');
      expect(result.rows.length).toBe(0);
    });

    it('should provide meaningful error messages', async () => {
      try {
        await service.query('SELECT * FROM nonexistent_table');
      } catch (error: any) {
        expect(error).toBeInstanceOf(QueryError);
        expect(error.message).toContain('Query failed');
      }
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      expect(service.isConnected()).toBe(true);
      await service.cleanup();
      expect(service.isConnected()).toBe(false);
    });

    it('should handle cleanup when already disconnected', async () => {
      await service.cleanup();
      // Should not throw error when calling cleanup again
      await expect(service.cleanup()).resolves.not.toThrow();
    });

    it('should allow reinitialization after cleanup', async () => {
      await service.cleanup();
      expect(service.isConnected()).toBe(false);

      await service.initialize();
      expect(service.isConnected()).toBe(true);
    });
  });
});

describe('Database Utils', () => {
  describe('validateConfig', () => {
    it('should accept valid SQLite config', () => {
      expect(() =>
        validateConfig({
          type: 'sqlite',
          inMemory: true,
        })
      ).not.toThrow();
    });

    it('should accept valid SQLite config with filename', () => {
      expect(() =>
        validateConfig({
          type: 'sqlite',
          filename: './test.db',
        })
      ).not.toThrow();
    });

    it('should reject SQLite config without filename or inMemory', () => {
      expect(() =>
        validateConfig({
          type: 'sqlite',
        })
      ).toThrow(ValidationError);
    });

    it('should reject invalid pool configuration', () => {
      expect(() =>
        validateConfig({
          type: 'sqlite',
          inMemory: true,
          poolMin: 10,
          poolMax: 5,
        })
      ).toThrow(ValidationError);
    });

    it('should require database type', () => {
      expect(() =>
        validateConfig({} as any)
      ).toThrow(ValidationError);
    });
  });

  describe('validateTableName', () => {
    it('should accept valid table names', () => {
      expect(() => validateTableName('users')).not.toThrow();
      expect(() => validateTableName('user_profiles')).not.toThrow();
      expect(() => validateTableName('_temp_table')).not.toThrow();
    });

    it('should reject empty table name', () => {
      expect(() => validateTableName('')).toThrow(ValidationError);
      expect(() => validateTableName('   ')).toThrow(ValidationError);
    });

    it('should reject table names starting with numbers', () => {
      expect(() => validateTableName('123table')).toThrow(ValidationError);
    });

    it('should reject table names with special characters', () => {
      expect(() => validateTableName('table-name')).toThrow(ValidationError);
      expect(() => validateTableName('table.name')).toThrow(ValidationError);
      expect(() => validateTableName('table name')).toThrow(ValidationError);
    });

    it('should reject SQL reserved keywords', () => {
      expect(() => validateTableName('SELECT')).toThrow(ValidationError);
      expect(() => validateTableName('INSERT')).toThrow(ValidationError);
      expect(() => validateTableName('TABLE')).toThrow(ValidationError);
    });
  });

  describe('validateColumnName', () => {
    it('should accept valid column names', () => {
      expect(() => validateColumnName('id')).not.toThrow();
      expect(() => validateColumnName('user_name')).not.toThrow();
      expect(() => validateColumnName('_created_at')).not.toThrow();
    });

    it('should reject empty column name', () => {
      expect(() => validateColumnName('')).toThrow(ValidationError);
    });

    it('should reject invalid column names', () => {
      expect(() => validateColumnName('123column')).toThrow(ValidationError);
      expect(() => validateColumnName('column-name')).toThrow(ValidationError);
    });

    it('should reject SQL reserved keywords', () => {
      expect(() => validateColumnName('SELECT')).toThrow(ValidationError);
      expect(() => validateColumnName('WHERE')).toThrow(ValidationError);
    });
  });

  describe('escapeIdentifier', () => {
    it('should escape PostgreSQL identifiers', () => {
      expect(escapeIdentifier('table', 'postgres')).toBe('"table"');
      expect(escapeIdentifier('user_name', 'postgres')).toBe('"user_name"');
    });

    it('should escape MySQL identifiers', () => {
      expect(escapeIdentifier('table', 'mysql')).toBe('`table`');
      expect(escapeIdentifier('user_name', 'mysql')).toBe('`user_name`');
    });

    it('should escape SQL Server identifiers', () => {
      expect(escapeIdentifier('table', 'sqlserver')).toBe('[table]');
      expect(escapeIdentifier('user_name', 'sqlserver')).toBe('[user_name]');
    });

    it('should handle special characters', () => {
      expect(escapeIdentifier('table"name', 'postgres')).toBe('"table""name"');
    });
  });

  describe('buildInsertSQL', () => {
    it('should build INSERT statement', () => {
      const result = buildInsertSQL(
        'users',
        { name: 'John', age: 30 },
        'postgres'
      );

      expect(result.sql).toContain('INSERT INTO');
      expect(result.sql).toContain('"users"');
      expect(result.sql).toContain('"name"');
      expect(result.sql).toContain('"age"');
      expect(result.params).toEqual(['John', 30]);
    });

    it('should handle single column', () => {
      const result = buildInsertSQL('users', { name: 'John' }, 'postgres');

      expect(result.sql).toContain('INSERT INTO');
      expect(result.params).toEqual(['John']);
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build UPDATE statement', () => {
      const result = buildUpdateSQL(
        'users',
        { name: 'Jane', age: 25 },
        [{ column: 'id', operator: '=', value: 1 }],
        'postgres'
      );

      expect(result.sql).toContain('UPDATE');
      expect(result.sql).toContain('"users"');
      expect(result.sql).toContain('SET');
      expect(result.sql).toContain('WHERE');
      expect(result.params).toContain('Jane');
      expect(result.params).toContain(25);
      expect(result.params).toContain(1);
    });
  });

  describe('buildDeleteSQL', () => {
    it('should build DELETE statement', () => {
      const result = buildDeleteSQL(
        'users',
        [{ column: 'id', operator: '=', value: 1 }],
        'postgres'
      );

      expect(result.sql).toContain('DELETE FROM');
      expect(result.sql).toContain('"users"');
      expect(result.sql).toContain('WHERE');
      expect(result.params).toEqual([1]);
    });

    it('should build DELETE without WHERE clause', () => {
      const result = buildDeleteSQL('users', [], 'postgres');

      expect(result.sql).toContain('DELETE FROM');
      expect(result.sql).not.toContain('WHERE');
      expect(result.params).toEqual([]);
    });
  });
});
