# Next Session: Migration Tool Completion

**Priority**: High
**Estimated Time**: 8-12 hours to MVP
**Current Progress**: 30% complete (foundation done)

## Quick Context

### What's Complete ✅
1. **Logger Capsule** - 100% done (2,910 lines)
2. **Migration Tool Foundation** - 30% done (1,410 lines)
   - ✅ Type system (580 lines)
   - ✅ Parser engine (680 lines)
   - ✅ Generator orchestrator (150 lines)
   - ✅ Complete specifications

### What's Needed ⏳
1. **8 File Generators** - 0% (needed for MVP)
2. **Validator** - 0%
3. **Reporter** - 0%
4. **CLI** - 0%

## Immediate Tasks (8 hours to MVP)

### Task 1: Implement Error Generator (1 hour)
**File**: `tools/capsule-migrate/src/generator/generators/errors.ts`

**Purpose**: Generate errors.ts file with minimum 8 error types

**Template to follow**: See [logger/errors.ts](packages/capsules/src/logger/errors.ts)

**Key requirements**:
```typescript
// Generate:
export enum {CapsuleName}ErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
}

export class {CapsuleName}Error extends Error {
  constructor(
    message: string,
    public readonly type: {CapsuleName}ErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = '{CapsuleName}Error';
  }

  toJSON() { /* ... */ }
}

// Generate 8+ specific error classes
export class ConfigurationError extends {CapsuleName}Error { /* ... */ }
// ... etc
```

### Task 2: Implement Types Generator (1 hour)
**File**: `tools/capsule-migrate/src/generator/generators/types.ts`

**Purpose**: Generate types.ts with all type definitions

**Template to follow**: See [logger/types.ts](packages/capsules/src/logger/types.ts)

**Key requirements**:
```typescript
// Extract from ParsedCapsule and generate:
export interface {CapsuleName}Config {
  // ... config options
}

export interface {CapsuleName}Input {
  // ... input parameters
}

export interface {CapsuleName}Result {
  success: boolean;
  // ... output values
  error?: string;
}

export interface {CapsuleName}Stats {
  // ... statistics
}

// Plus all extracted types from original capsule
```

### Task 3: Implement Constants Generator (1 hour)
**File**: `tools/capsule-migrate/src/generator/generators/constants.ts`

**Purpose**: Generate constants.ts with defaults

**Template to follow**: See [logger/constants.ts](packages/capsules/src/logger/constants.ts)

**Key requirements**:
```typescript
// Generate:
export const DEFAULT_CONFIG: Required<{CapsuleName}Config> = {
  // ... with sensible defaults
};

export const INITIAL_STATS: {CapsuleName}Stats = {
  // ... all zeros
};

// Plus other constants from original capsule
```

### Task 4: Implement Service Generator (1 hour)
**File**: `tools/capsule-migrate/src/generator/generators/service.ts`

**Purpose**: Generate service.ts with lifecycle methods

**Template to follow**: See [logger/service.ts](packages/capsules/src/logger/service.ts)

**Key requirements**:
```typescript
// Generate:
export class {CapsuleName}Service {
  private config: Required<{CapsuleName}Config>;
  private stats: {CapsuleName}Stats;
  private initialized: boolean = false;

  constructor(config: {CapsuleName}Config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = { ...INITIAL_STATS };
  }

  async initialize(): Promise<void> {
    // TODO: Implement initialization
    this.initialized = true;
  }

  async execute(input: {CapsuleName}Input): Promise<{CapsuleName}Result> {
    if (!this.initialized) {
      throw new InitializationError('Service not initialized');
    }
    // TODO: Implement execution logic
    return { success: true };
  }

  async cleanup(): Promise<void> {
    // TODO: Implement cleanup
    this.initialized = false;
  }

  getStats(): {CapsuleName}Stats {
    return { ...this.stats };
  }
}

export function create{CapsuleName}(config?: Partial<{CapsuleName}Config>): {CapsuleName}Service {
  return new {CapsuleName}Service(config || {});
}
```

### Task 5: Implement Utils Generator (30 min)
**File**: `tools/capsule-migrate/src/generator/generators/utils.ts`

**Purpose**: Generate utils.ts with helper functions

**Template to follow**: See [logger/utils.ts](packages/capsules/src/logger/utils.ts)

### Task 6: Implement Adapters Generator (30 min)
**File**: `tools/capsule-migrate/src/generator/generators/adapters.ts`

**Purpose**: Generate adapters.ts with platform-specific code (if needed)

**Template to follow**: See [logger/adapters.ts](packages/capsules/src/logger/adapters.ts)

### Task 7: Implement Index Generator (30 min)
**File**: `tools/capsule-migrate/src/generator/generators/index.ts`

**Purpose**: Generate index.ts with public API exports

**Template to follow**: See [logger/index.ts](packages/capsules/src/logger/index.ts)

**Key requirements**:
```typescript
// Generate:
export * from './types';
export * from './errors';
export { {CapsuleName}Service, create{CapsuleName} } from './service';

export const {CapsuleName}Capsule = {
  id: '{capsule-id}',
  name: '{Capsule Name}',
  version: '1.0.0',
  category: '{Category}',
  description: '{Description}',
  platforms: ['node'],
  tags: [],
  // ... metadata
};
```

### Task 8: Implement README Generator (30 min)
**File**: `tools/capsule-migrate/src/generator/generators/readme.ts`

**Purpose**: Generate README.md with documentation

**Template to follow**: See [logger/README.md](packages/capsules/src/logger/README.md)

**Key sections**:
- Quick start
- Installation
- Configuration
- Usage examples (minimum 5)
- API reference
- Best practices
- Troubleshooting

### Task 9: Implement Basic CLI (2 hours)
**File**: `tools/capsule-migrate/src/cli/index.ts`

**Purpose**: Create command-line interface

**Commands needed**:
```bash
# Analyze capsule
capsule-migrate analyze /path/to/capsule

# Migrate single capsule
capsule-migrate migrate /path/to/capsule --output /output/path

# Validate migrated capsule
capsule-migrate validate /path/to/migrated
```

**Libraries**: Commander.js, Chalk, Ora

### Task 10: Implement Basic Validator (2 hours)
**File**: `tools/capsule-migrate/src/validator/index.ts`

**Purpose**: Validate generated code

**Checks needed**:
1. All 8 files exist
2. TypeScript compiles without errors
3. Minimum 8 error types present
4. Service has lifecycle methods
5. README has examples

## Testing Strategy

### Test Capsule 1: capsule-validation
**Location**: `/Users/c/Capsula/capsule-validation/` (if exists)

Simple capsule for initial testing:
1. Run parser
2. Check extracted data
3. Generate 8 files
4. Validate output
5. Verify TypeScript compiles

### Test Capsule 2-5: Pick 4 more simple capsules
After first success, test with:
- Different categories
- Different complexities
- Different patterns

## Success Criteria

### MVP Complete When:
- ✅ Can parse existing capsule
- ✅ Can generate all 8 files
- ✅ Generated code compiles
- ✅ Passes basic validation
- ✅ CLI works for single capsule migration

### Production Ready When:
- ✅ Batch migration works
- ✅ All 22 validation checks pass
- ✅ Reports generated
- ✅ Tested with 10+ capsules
- ✅ 90%+ success rate

## Quick Start Commands

```bash
# Set up project
cd /Users/c/capsulas-framework/tools/capsule-migrate

# Install dependencies (need to create package.json first)
npm install

# Test parser
npm run test:parser

# Test generator
npm run test:generator

# Run full migration
npm run migrate -- /path/to/capsule
```

## Reference Files

**Study these completed capsules**:
1. [Database Capsule](../packages/capsules/src/database/) - 3,355 lines
2. [Logger Capsule](../packages/capsules/src/logger/) - 2,910 lines

**Key patterns to replicate**:
- Service class structure
- Error hierarchy
- Factory functions
- Stats tracking
- README structure

## Key Decisions Already Made

1. ✅ 8-file structure is mandatory
2. ✅ Minimum 8 error types required
3. ✅ Service must have initialize/execute/cleanup
4. ✅ TypeScript strict mode
5. ✅ README must have 5+ examples
6. ✅ All public APIs must have JSDoc

## Estimated Timeline

| Task | Time | Cumulative |
|------|------|------------|
| Error generator | 1h | 1h |
| Types generator | 1h | 2h |
| Constants generator | 1h | 3h |
| Service generator | 1h | 4h |
| Utils generator | 0.5h | 4.5h |
| Adapters generator | 0.5h | 5h |
| Index generator | 0.5h | 5.5h |
| README generator | 0.5h | 6h |
| Basic CLI | 2h | 8h |
| Basic Validator | 2h | 10h |
| Testing & Fixes | 2h | 12h |

**MVP**: 8 hours (generators + basic CLI)
**Production**: 12 hours total

## ROI Reminder

**Investment**: 16 hours (4 done + 12 remaining)
**Return**: 242 hours saved (54% reduction)
**ROI**: 1,513%

Plus:
- 100% architecture consistency
- Automated quality checks
- Reduced human error
- Knowledge capture

## Next Session Start

**First action**: Create package.json for migration tool with dependencies:
```json
{
  "name": "@capsulas/migrate",
  "version": "1.0.0",
  "dependencies": {
    "typescript": "^5.3.0",
    "@typescript-eslint/parser": "^6.0.0",
    "commander": "^11.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0",
    "prettier": "^3.0.0"
  }
}
```

**Then**: Start implementing generators in order listed above.

---

**Status**: Ready to continue
**Path**: Clear and well-defined
**Blockers**: None
**Risk**: Low (foundation is solid)
