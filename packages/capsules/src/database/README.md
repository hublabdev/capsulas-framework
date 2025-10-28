## Database Capsule

Complete database solution with query execution, migrations, schema management, and transaction support.

### Features

- **Multiple Databases**: SQLite, PostgreSQL, MySQL, SQL Server, MongoDB
- **Connection Management**: Automatic retry, connection pooling
- **Query Execution**: Type-safe queries with parameter binding
- **Transactions**: Full ACID transaction support
- **Migrations**: Version-controlled database schema changes
- **Seeders**: Database seeding for test data
- **Schema Management**: Create, drop, alter tables programmatically
- **Statistics**: Track query performance and execution metrics
- **Platform Support**: Node.js, Web, Mobile, Desktop

### Installation

```bash
npm install @capsulas/capsules
```

### Quick Start

#### SQLite (In-Memory)

```typescript
import { createSQLiteDatabase } from '@capsulas/capsules/database';

// Create in-memory database
const db = createSQLiteDatabase(':memory:');

// Initialize
await db.initialize();

// Execute query
const result = await db.query('SELECT * FROM users WHERE active = ?', [true]);
console.log(result.rows);

// Cleanup
await db.cleanup();
```

#### PostgreSQL

```typescript
import { createPostgresDatabase } from '@capsulas/capsules/database';

const db = createPostgresDatabase({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  username: 'user',
  password: 'password',
});

await db.initialize();

// Insert data
await db.executeSQL(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  ['John Doe', 'john@example.com']
);
```

#### From Environment Variable

```typescript
import { createDatabaseFromEnv } from '@capsulas/capsules/database';

// Reads from process.env.DATABASE_URL
const db = createDatabaseFromEnv({
  logQueries: true,
  autoMigrate: true,
});

await db.initialize();
```

### Configuration

#### SQLite

```typescript
{
  type: 'sqlite',
  filename: './database.sqlite',  // or use inMemory: true
  logQueries: true,
  autoMigrate: false,
}
```

#### PostgreSQL

```typescript
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  username: 'user',
  password: 'password',
  ssl: true,
  poolMin: 2,
  poolMax: 10,
}
```

#### MySQL

```typescript
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'mydb',
  username: 'user',
  password: 'password',
  charset: 'utf8mb4',
}
```

#### Connection String

```typescript
{
  connectionString: 'postgresql://user:password@localhost:5432/mydb',
}
```

### Usage Examples

#### Basic Queries

```typescript
// SELECT query
const users = await db.query('SELECT * FROM users WHERE age > ?', [18]);

// INSERT with auto-generated ID
const result = await db.executeSQL(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Alice', 'alice@example.com']
);
console.log('Inserted ID:', result.insertId);

// UPDATE
const updated = await db.executeSQL(
  'UPDATE users SET active = ? WHERE id = ?',
  [true, 123]
);
console.log('Rows updated:', updated.affectedRows);

// DELETE
await db.executeSQL('DELETE FROM users WHERE active = ?', [false]);
```

#### Transactions

```typescript
await db.transaction(async (trx) => {
  // Transfer money between accounts
  await trx.execute(
    'UPDATE accounts SET balance = balance - ? WHERE id = ?',
    [100, fromAccountId]
  );

  await trx.execute(
    'UPDATE accounts SET balance = balance + ? WHERE id = ?',
    [100, toAccountId]
  );

  // If any operation fails, entire transaction is rolled back automatically
});
```

#### Schema Management

```typescript
// Create table
await db.createTable({
  name: 'users',
  columns: [
    { name: 'id', type: 'integer', primary: true, autoIncrement: true },
    { name: 'name', type: 'string', length: 255, nullable: false },
    { name: 'email', type: 'string', length: 255, unique: true },
    { name: 'age', type: 'integer' },
    { name: 'active', type: 'boolean', defaultValue: true },
    { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
  ],
  indexes: [
    { name: 'idx_email', columns: ['email'], unique: true },
    { name: 'idx_active', columns: ['active'] },
  ],
});

// Drop table
await db.dropTable('users');

// Check if table exists
const exists = await db.hasTable('users');

// Get all tables
const tables = await db.getTables();
```

#### Migrations

```typescript
// Register migration
db.registerMigration({
  id: '001',
  name: 'create_users_table',
  timestamp: Date.now(),

  async up(adapter) {
    await adapter.createTable({
      name: 'users',
      columns: [
        { name: 'id', type: 'integer', primary: true, autoIncrement: true },
        { name: 'name', type: 'string', length: 255 },
        { name: 'email', type: 'string', length: 255, unique: true },
      ],
    });
  },

  async down(adapter) {
    await adapter.dropTable('users');
  },
});

// Run pending migrations
await db.runMigrations();

// Rollback last migration batch
await db.rollbackMigrations(1);

// Check migration status
const status = await db.getMigrationStatus();
console.log('Pending:', status.pending.length);
console.log('Executed:', status.executed.length);
```

#### Seeders

```typescript
// Register seeder
db.registerSeeder({
  name: 'UserSeeder',
  async run(adapter) {
    await adapter.execute(
      'INSERT INTO users (name, email) VALUES (?, ?), (?, ?)',
      [
        'Alice', 'alice@example.com',
        'Bob', 'bob@example.com',
      ]
    );
  },
});

// Run all seeders
await db.runSeeders();
```

#### Statistics

```typescript
const stats = db.getStats();

console.log('Queries executed:', stats.queriesExecuted);
console.log('Queries failed:', stats.queriesFailed);
console.log('Average query time:', stats.averageQueryTime, 'ms');
console.log('Active connections:', stats.connectionsActive);
console.log('Transactions committed:', stats.transactionsCommitted);
console.log('Transactions rolled back:', stats.transactionsRolledBack);
```

#### Using Execute Method (Capsule Pattern)

```typescript
// Execute a query through the capsule interface
const result = await db.execute({
  operation: 'query',
  sql: 'SELECT * FROM users WHERE active = ?',
  params: [true],
});

if (result.success) {
  console.log('Data:', result.data.rows);
  console.log('Query time:', result.metadata.queryTime, 'ms');
} else {
  console.error('Error:', result.error);
}
```

### Advanced Usage

#### Query Builder (Coming Soon)

```typescript
// Type-safe query building
const users = await db.table('users')
  .select('id', 'name', 'email')
  .where('age', '>', 18)
  .where('active', '=', true)
  .orderBy('created_at', 'DESC')
  .limit(10)
  .get();
```

#### Connection Pooling

```typescript
const db = createPostgresDatabase({
  host: 'localhost',
  database: 'mydb',
  poolMin: 2,        // Minimum connections
  poolMax: 10,       // Maximum connections
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 5000,  // Wait max 5s for connection
});
```

#### Retry Logic

```typescript
const db = createDatabaseService({
  type: 'postgres',
  host: 'localhost',
  database: 'mydb',
  retryAttempts: 3,      // Retry failed queries 3 times
  retryDelay: 1000,      // Wait 1s between retries (exponential backoff)
});
```

#### Platform-Specific Adapters

```typescript
import { detectPlatform, isDatabaseSupported } from '@capsulas/capsules/database';

const platform = detectPlatform();
console.log('Platform:', platform);  // 'node', 'web', 'mobile', or 'desktop'

const supported = isDatabaseSupported('postgres', platform);
if (!supported) {
  console.error('PostgreSQL not supported on this platform');
}
```

### Error Handling

```typescript
import {
  DatabaseError,
  ConnectionError,
  QueryError,
  MigrationError,
  isDatabaseError,
} from '@capsulas/capsules/database';

try {
  await db.query('SELECT * FROM users');
} catch (error) {
  if (isDatabaseError(error)) {
    console.error('Database error:', error.type);
    console.error('Message:', error.message);
    console.error('Query:', error.query);
    console.error('Original error:', error.originalError);
  }
}
```

### Environment Variables

The capsule reads the following environment variables:

```bash
# Full connection string (alternative to individual fields)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Or individual fields (for createDatabaseFromEnv)
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mydb
DATABASE_USER=user
DATABASE_PASSWORD=password
```

### Connection String Formats

```bash
# PostgreSQL
postgresql://user:password@localhost:5432/mydb
postgres://user:password@localhost:5432/mydb

# MySQL
mysql://user:password@localhost:3306/mydb

# SQL Server
sqlserver://user:password@localhost:1433/mydb
mssql://user:password@localhost:1433/mydb

# MongoDB
mongodb://user:password@localhost:27017/mydb

# SQLite
sqlite:./database.sqlite
sqlite::memory:
```

### Best Practices

1. **Always cleanup**: Call `await db.cleanup()` when done
2. **Use transactions**: For multi-step operations that should be atomic
3. **Use parameters**: Never concatenate user input into SQL strings
4. **Enable connection pooling**: For server applications
5. **Monitor statistics**: Track query performance
6. **Use migrations**: For schema versioning
7. **Handle errors**: Wrap database calls in try/catch
8. **Environment variables**: Store credentials securely

### Testing

```typescript
import { createSQLiteDatabase } from '@capsulas/capsules/database';

describe('Database Tests', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    // Use in-memory database for tests
    db = createSQLiteDatabase(':memory:');
    await db.initialize();

    // Create test schema
    await db.createTable({
      name: 'users',
      columns: [
        { name: 'id', type: 'integer', primary: true, autoIncrement: true },
        { name: 'name', type: 'string', length: 255 },
      ],
    });
  });

  afterEach(async () => {
    await db.cleanup();
  });

  test('should insert and query users', async () => {
    await db.executeSQL('INSERT INTO users (name) VALUES (?)', ['Alice']);

    const result = await db.query('SELECT * FROM users');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('Alice');
  });
});
```

### TypeScript Support

Full TypeScript support with generics:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

// Type-safe query result
const result = await db.query<User>('SELECT * FROM users');
const users: User[] = result.rows;

// Type-safe table operations
const user = await db.table<User>('users').first();
if (user) {
  console.log(user.name);  // TypeScript knows this exists
}
```

### Performance Tips

1. **Use connection pooling** for concurrent requests
2. **Create indexes** on frequently queried columns
3. **Use prepared statements** (automatic with parameter binding)
4. **Batch inserts** instead of individual INSERTs
5. **Use transactions** for multiple related operations
6. **Monitor statistics** to identify slow queries
7. **Consider read replicas** for high-read workloads

### Troubleshooting

#### Connection Errors

```typescript
// Enable debug logging
const db = createDatabaseService({
  type: 'postgres',
  host: 'localhost',
  database: 'mydb',
  debug: true,        // Log connection details
  logQueries: true,   // Log all queries
});
```

#### Query Timeouts

```typescript
const db = createDatabaseService({
  type: 'postgres',
  host: 'localhost',
  database: 'mydb',
  connectionTimeoutMillis: 10000,  // Increase timeout
});
```

#### Migration Issues

```typescript
// Check migration status
const status = await db.getMigrationStatus();
console.log('Pending migrations:', status.pending);
console.log('Last batch:', status.lastBatch);

// Rollback if needed
await db.rollbackMigrations(1);
```

### API Reference

See [types.ts](./types.ts) for complete API documentation.

### License

MIT
