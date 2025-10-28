# Capsule Migration Tool - Technical Specification

## Executive Summary

Automated tool to migrate existing capsules and generate new capsules following the standardized 8-file architecture pattern.

**ROI**: 3,450% (saves 276 hours with 8-hour investment)
**Timeline**: 16 hours development, 20 hours execution (vs. 296 hours manual)
**Quality Target**: 100% architecture compliance, >80% test coverage

## Architecture Overview

```
migration-tool/
├── src/
│   ├── parser/          # Analyze existing capsule code
│   ├── generator/       # Generate new 8-file structure
│   ├── validator/       # Validate output quality
│   ├── reporter/        # Create migration reports
│   └── cli/             # Command-line interface
├── templates/           # Code templates for generation
├── config/              # Migration configurations
└── output/              # Migration reports
```

## Core Components

### 1. Capsule Parser

**Purpose**: Analyze existing capsule implementations to extract functionality

**Input**:
- Path to existing capsule directory
- Capsule metadata (name, category, description)

**Output**:
```typescript
interface ParsedCapsule {
  metadata: {
    id: string;
    name: string;
    category: string;
    description: string;
    version: string;
    platform: Platform[];
  };

  analysis: {
    // Types found in code
    types: TypeDefinition[];

    // Interfaces and classes
    interfaces: InterfaceDefinition[];
    classes: ClassDefinition[];

    // Functions and methods
    functions: FunctionDefinition[];
    methods: MethodDefinition[];

    // Constants and configurations
    constants: ConstantDefinition[];
    configs: ConfigDefinition[];

    // Dependencies
    imports: ImportStatement[];
    dependencies: string[];

    // Error handling patterns
    errorTypes: ErrorDefinition[];

    // Exports (public API)
    exports: ExportStatement[];
  };

  // Complexity metrics
  complexity: {
    linesOfCode: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    estimatedMigrationHours: number;
  };

  // Quality indicators
  quality: {
    hasTypes: boolean;
    hasErrors: boolean;
    hasTests: boolean;
    hasDocumentation: boolean;
    testCoverage?: number;
  };
}
```

**Key Features**:
- AST parsing using TypeScript Compiler API
- Detect existing patterns (types, errors, configs, utils)
- Extract JSDoc comments for documentation
- Identify platform-specific code
- Calculate complexity metrics

### 2. Code Generator

**Purpose**: Generate standardized 8-file structure from parsed capsule

**Templates**: One template per file type
- `types.template.ts`
- `errors.template.ts`
- `constants.template.ts`
- `utils.template.ts`
- `adapters.template.ts`
- `service.template.ts`
- `index.template.ts`
- `README.template.md`

**Generation Strategy**:

#### A. Automatic Generation (Simple Capsules)
Capsules with low complexity can be fully automated:
- Straightforward functionality
- No platform-specific code
- Clear input/output patterns
- Standard error handling

**Criteria for Auto-generation**:
- Cyclomatic complexity < 10
- Lines of code < 500
- No external API dependencies
- No file system operations
- No database operations

**Process**:
1. Extract types from existing code
2. Generate error types (minimum 8)
3. Generate constants with sensible defaults
4. Generate utils from helper functions
5. Generate single adapter (or platform-specific if needed)
6. Generate service class with lifecycle
7. Generate index with exports
8. Generate README with examples

#### B. Semi-Automatic Generation (Medium Capsules)
Capsules requiring some manual intervention:
- Generate scaffold (8 files)
- Mark TODOs for manual completion
- Provide implementation hints
- Generate comprehensive comments

**Criteria**:
- Cyclomatic complexity 10-30
- Lines of code 500-2000
- Some external dependencies
- Moderate platform-specific code

**Process**:
1. Generate all 8 files with structure
2. Insert `// TODO: Implement...` markers
3. Include hints from existing code
4. Generate detailed JSDoc templates
5. Create migration guide for this capsule

#### C. Manual Migration (Complex Capsules)
Complex capsules need human expertise:
- Generate only file structure
- Provide detailed migration guide
- List required decisions
- Reference similar completed capsules

**Criteria**:
- Cyclomatic complexity > 30
- Lines of code > 2000
- Complex external dependencies
- Heavy platform-specific logic
- Critical business logic

**Examples**: Database, Logger (already manually migrated)

### 3. Template System

**Template Format**: Handlebars-style with custom helpers

```typescript
// types.template.ts
{{#fileHeader}}
/**
 * Type definitions for {{capsule.name}} capsule
 * @category {{capsule.category}}
 * @module @capsulas/{{capsule.id}}
 */
{{/fileHeader}}

{{#each types}}
export type {{name}} = {{definition}};
{{/each}}

{{#each interfaces}}
export interface {{name}} {
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}
{{/each}}

// Service configuration
export interface {{pascalCase capsule.name}}Config {
  {{#each configOptions}}
  {{name}}?: {{type}};
  {{/each}}
}

// Service input/output
export interface {{pascalCase capsule.name}}Input {
  {{#each inputs}}
  {{name}}: {{type}};
  {{/each}}
}

export interface {{pascalCase capsule.name}}Result {
  success: boolean;
  {{#each outputs}}
  {{name}}?: {{type}};
  {{/each}}
  error?: string;
}
```

**Template Variables**:
```typescript
interface TemplateContext {
  capsule: {
    id: string;
    name: string;
    category: string;
    description: string;
    version: string;
  };

  types: TypeDefinition[];
  interfaces: InterfaceDefinition[];
  constants: ConstantDefinition[];
  errors: ErrorDefinition[];
  functions: FunctionDefinition[];

  // Helper flags
  hasFileSystem: boolean;
  hasNetwork: boolean;
  hasDatabase: boolean;
  isMultiPlatform: boolean;

  // Metadata
  generatedDate: string;
  generatedBy: string;
  migrationNotes: string[];
}
```

**Custom Template Helpers**:
```typescript
// Case conversions
pascalCase(str: string): string
camelCase(str: string): string
snakeCase(str: string): string
upperCase(str: string): string

// Code generation
generateErrorTypes(count: number): ErrorDefinition[]
generateDefaultConfig(fields: ConfigField[]): string
generateJSDoc(definition: Definition): string

// Conditionals
hasComplexity(threshold: number): boolean
isPlatformSpecific(platform: Platform): boolean
requiresAdapter(functionality: string): boolean
```

### 4. Validation System

**Purpose**: Ensure generated code meets quality standards

**Validation Checks**:

```typescript
interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100

  checks: {
    // File structure
    hasAllFiles: boolean;           // All 8 files present
    filesNonEmpty: boolean;         // No empty files

    // Types
    hasTypes: boolean;              // types.ts has definitions
    typesCompile: boolean;          // TypeScript compiles

    // Errors
    hasMinimumErrors: boolean;      // Minimum 8 error types
    errorsExtendBase: boolean;      // All extend base error

    // Constants
    hasConstants: boolean;          // constants.ts has exports
    hasDefaults: boolean;           // DEFAULT_CONFIG present

    // Utils
    hasUtils: boolean;              // utils.ts has functions
    utilsDocumented: boolean;       // JSDoc for all utils

    // Service
    hasServiceClass: boolean;       // Service class exists
    hasLifecycle: boolean;          // initialize/execute/cleanup
    lifecycleAsync: boolean;        // Methods are async

    // Index
    hasExports: boolean;            // Public API exported
    hasCapsuleMetadata: boolean;    // Capsule object exported

    // README
    hasReadme: boolean;             // README.md exists
    hasExamples: boolean;           // Minimum 5 examples
    hasQuickStart: boolean;         // Quick start section

    // Code quality
    noLintErrors: boolean;          // ESLint passes
    noTypeErrors: boolean;          // TypeScript strict mode
    followsConventions: boolean;    // Naming conventions

    // Documentation
    allPublicDocumented: boolean;   // JSDoc for public APIs
    hasApiReference: boolean;       // README has API section
  };
}
```

**Validation Levels**:

1. **Critical** (Must pass):
   - All 8 files present
   - TypeScript compiles without errors
   - Service has lifecycle methods
   - Minimum 8 error types

2. **High** (Should pass):
   - No ESLint errors
   - All public APIs documented
   - README has examples
   - Exports capsule metadata

3. **Medium** (Nice to have):
   - Test coverage > 80%
   - All utils have JSDoc
   - README has troubleshooting

4. **Low** (Optional):
   - Advanced examples
   - Performance benchmarks
   - Migration guide

### 5. Report Generator

**Purpose**: Document migration process and results

**Report Types**:

#### A. Individual Capsule Report

```markdown
# Migration Report: capsule-{name}

**Status**: ✅ Complete | ⚠️ Partial | ❌ Failed
**Migration Type**: Automatic | Semi-Automatic | Manual
**Time Taken**: 2.5 hours
**Generated**: 2025-01-26T10:30:00Z

## Summary

- **Before**: 1 file, 450 lines
- **After**: 8 files, 890 lines
- **Quality Score**: 92/100

## File Breakdown

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| types.ts | 150 | ✅ | 15 types generated |
| errors.ts | 120 | ✅ | 10 error types |
| constants.ts | 80 | ✅ | All defaults |
| utils.ts | 200 | ✅ | 12 utilities |
| adapters.ts | 150 | ✅ | 1 adapter |
| service.ts | 120 | ✅ | Full lifecycle |
| index.ts | 40 | ✅ | Complete exports |
| README.md | 230 | ✅ | 7 examples |

## Validation Results

✅ TypeScript compilation: Passed
✅ ESLint: Passed
✅ Minimum error types: Passed (10/8)
✅ Public API documentation: Passed
⚠️ Test coverage: 75% (target: 80%)

## Manual Actions Required

- [ ] Add 2 more test cases for edge cases
- [ ] Review adapter implementation for mobile platform

## Migration Notes

- Extracted 15 types from existing implementation
- Generated error types based on functionality
- Preserved all existing functionality
- Enhanced documentation with 4 new examples
```

#### B. Batch Migration Report

```markdown
# Batch Migration Report

**Date**: 2025-01-26
**Capsules Migrated**: 10
**Success Rate**: 90%
**Total Time**: 12 hours

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total capsules | 10 |
| Successful | 9 |
| Failed | 1 |
| Avg quality score | 88/100 |
| Total lines generated | 8,450 |
| Avg time per capsule | 1.2 hours |

## Capsules by Status

### ✅ Complete (9)

1. capsule-validation (Score: 95)
2. capsule-cache (Score: 92)
3. capsule-http-client (Score: 90)
4. capsule-rate-limit (Score: 88)
5. capsule-queue (Score: 87)
6. capsule-scheduler (Score: 86)
7. capsule-metrics (Score: 85)
8. capsule-config-loader (Score: 84)
9. capsule-email (Score: 82)

### ❌ Failed (1)

1. capsule-payment-stripe (Reason: Complex external API, requires manual migration)

## Quality Breakdown

| Score Range | Count |
|-------------|-------|
| 90-100 | 3 |
| 80-89 | 6 |
| 70-79 | 0 |
| Below 70 | 1 (failed) |

## Next Steps

1. Manual migration of capsule-payment-stripe
2. Improve test coverage for 3 capsules
3. Review and merge PRs
```

#### C. Progress Dashboard

```markdown
# Capsules Framework - Migration Progress

**Last Updated**: 2025-01-26 15:30:00

## Overall Progress

Total: 300 capsules

[████████████░░░░░░░░] 40% (120/300)

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Complete | 120 | 40% |
| 🔄 In Progress | 15 | 5% |
| ⏳ Pending | 165 | 55% |

## By Category

| Category | Total | Complete | In Progress | Pending |
|----------|-------|----------|-------------|---------|
| Infrastructure | 25 | 15 | 3 | 7 |
| Data Processing | 30 | 12 | 2 | 16 |
| Authentication | 20 | 18 | 1 | 1 |
| API Integration | 35 | 10 | 5 | 20 |
| File Operations | 25 | 20 | 2 | 3 |
| Cryptography | 20 | 8 | 1 | 11 |
| Testing | 15 | 12 | 0 | 3 |
| UI Components | 40 | 5 | 1 | 34 |
| Analytics | 18 | 6 | 0 | 12 |
| Database | 22 | 4 | 0 | 18 |
| Messaging | 20 | 5 | 0 | 15 |
| DevOps | 15 | 3 | 0 | 12 |
| ML/AI | 10 | 1 | 0 | 9 |
| Blockchain | 5 | 1 | 0 | 4 |

## Quality Metrics

| Metric | Average | Target |
|--------|---------|--------|
| Quality Score | 87/100 | 80+ |
| Test Coverage | 76% | 80% |
| Documentation | 92% | 100% |

## Timeline

- **Started**: 2025-01-20
- **Current Sprint**: Week 2 of 10
- **Estimated Completion**: 2025-03-30
- **Ahead/Behind**: On track

## Top Contributors

1. Migration Tool (Auto): 60 capsules
2. Manual Migration: 45 capsules
3. Semi-Auto + Review: 15 capsules
```

### 6. CLI Interface

**Command Structure**:

```bash
# Analyze existing capsule
capsule-migrate analyze <path> [--output report.json]

# Generate new capsule from template
capsule-migrate generate <name> --category <category> [--template <type>]

# Migrate single capsule
capsule-migrate migrate <source-path> [--output-dir <path>] [--mode auto|semi|manual]

# Batch migrate
capsule-migrate batch <config-file> [--parallel 4]

# Validate migrated capsule
capsule-migrate validate <path> [--strict]

# Generate reports
capsule-migrate report <path> [--format md|json|html]

# Interactive mode
capsule-migrate interactive
```

**Example Usage**:

```bash
# Analyze existing capsule
capsule-migrate analyze /Users/c/Capsula/capsule-validation
# Output: Complexity: 8, Lines: 420, Estimated: 2.5 hours, Recommended: Auto

# Migrate automatically
capsule-migrate migrate /Users/c/Capsula/capsule-validation \
  --output-dir /Users/c/capsulas-framework/packages/capsules/src/validation \
  --mode auto

# Validate output
capsule-migrate validate /Users/c/capsulas-framework/packages/capsules/src/validation
# Output: ✅ Passed (Score: 92/100)

# Batch migrate 10 capsules
capsule-migrate batch migration-config.json --parallel 4
```

**Configuration File** (`migration-config.json`):

```json
{
  "source": "/Users/c/Capsula",
  "output": "/Users/c/capsulas-framework/packages/capsules/src",
  "capsules": [
    {
      "name": "validation",
      "mode": "auto",
      "priority": "high"
    },
    {
      "name": "cache",
      "mode": "auto",
      "priority": "high"
    },
    {
      "name": "payment-stripe",
      "mode": "manual",
      "priority": "medium",
      "notes": "Complex external API"
    }
  ],
  "options": {
    "parallel": 4,
    "validateAfter": true,
    "generateReports": true,
    "gitCommit": true
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure (4 hours)
- [x] Project setup
- [ ] Type definitions
- [ ] Base classes and utilities
- [ ] Template engine integration

### Phase 2: Parser (3 hours)
- [ ] TypeScript AST parser
- [ ] Code analysis algorithms
- [ ] Complexity calculation
- [ ] Pattern detection

### Phase 3: Generator (4 hours)
- [ ] Template system
- [ ] Code generation engine
- [ ] File writer with formatting
- [ ] Error type generator

### Phase 4: Validator (2 hours)
- [ ] Validation rules engine
- [ ] TypeScript compilation check
- [ ] ESLint integration
- [ ] Quality scoring

### Phase 5: Reporter (1 hour)
- [ ] Markdown report generator
- [ ] JSON output
- [ ] Progress dashboard

### Phase 6: CLI (2 hours)
- [ ] Command parser
- [ ] Interactive prompts
- [ ] Progress indicators
- [ ] Error handling

## Testing Strategy

### Unit Tests
- Parser: Test with various capsule structures
- Generator: Verify template rendering
- Validator: Test validation rules
- Reporter: Check report formatting

### Integration Tests
- End-to-end migration of sample capsules
- Batch migration simulation
- Validation pipeline

### Acceptance Criteria
- Successfully migrate 10 test capsules
- All validation checks pass
- Quality scores > 85
- Reports generated correctly
- CLI commands work as expected

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to migrate capsule | < 1.5 hours avg | Actual time logged |
| Quality score | > 85/100 | Validation output |
| Success rate | > 95% | Passed/Total |
| Manual intervention | < 10% | Manual/Total |
| Time savings | > 250 hours | Manual - Automated |
| Code consistency | 100% | Architecture compliance |

## Risk Mitigation

### Risk 1: Complex capsules fail automated migration
**Mitigation**:
- Three-tier approach (auto/semi/manual)
- Clear complexity thresholds
- Detailed manual guides for complex cases

### Risk 2: Generated code doesn't compile
**Mitigation**:
- TypeScript validation in pipeline
- Template testing with sample data
- Rollback mechanism

### Risk 3: Quality scores too low
**Mitigation**:
- Iterative improvement of templates
- Manual review for low scores
- Quality threshold gates

### Risk 4: Tool takes too long to develop
**Mitigation**:
- MVP first (basic generation)
- Iterative enhancements
- Use off-the-shelf libraries

## Dependencies

### Required Libraries
```json
{
  "dependencies": {
    "@typescript-eslint/parser": "^6.0.0",
    "typescript": "^5.3.0",
    "handlebars": "^4.7.8",
    "commander": "^11.0.0",
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Development Tools
- TypeScript Compiler API (code parsing)
- Handlebars (templating)
- Commander.js (CLI)
- Inquirer.js (interactive prompts)
- Chalk (colored output)
- Ora (progress spinners)

## Deliverables

1. **Migration Tool** (`/tools/capsule-migrate/`)
   - Fully functional CLI tool
   - All core features implemented
   - Comprehensive tests (>80% coverage)

2. **Templates** (`/tools/capsule-migrate/templates/`)
   - All 8 file templates
   - Template helpers
   - Sample configurations

3. **Documentation**
   - User guide
   - API reference
   - Migration best practices
   - Troubleshooting guide

4. **Migration Reports**
   - Individual capsule reports
   - Batch migration reports
   - Progress dashboard

5. **Test Suite**
   - Unit tests for all components
   - Integration tests
   - Sample capsules for testing

## Next Steps

1. Set up migration tool project structure
2. Implement type definitions
3. Build template system
4. Create parser module
5. Build generator module
6. Implement validator
7. Create CLI interface
8. Test with sample capsules
9. Document usage
10. Begin batch migration

---

**Status**: Ready to implement
**Estimated Completion**: 16 hours
**Expected ROI**: 3,450% (276 hours saved)
