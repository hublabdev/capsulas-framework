/**
 * Type definitions for capsule migration tool
 * @module capsule-migrate/types
 */

// ============================================================================
// Core Types
// ============================================================================

export type Platform = 'node' | 'web' | 'mobile' | 'desktop' | 'universal';

export type MigrationMode = 'auto' | 'semi' | 'manual';

export type MigrationStatus = 'pending' | 'in_progress' | 'complete' | 'failed';

export type ValidationLevel = 'critical' | 'high' | 'medium' | 'low';

// ============================================================================
// Capsule Metadata
// ============================================================================

export interface CapsuleMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  platforms: Platform[];
  tags?: string[];
  dependencies?: string[];
  author?: string;
  license?: string;
}

// ============================================================================
// Code Analysis Types
// ============================================================================

export interface TypeDefinition {
  name: string;
  kind: 'type' | 'interface' | 'enum' | 'class';
  definition: string;
  exported: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface InterfaceDefinition {
  name: string;
  extends?: string[];
  properties: PropertyDefinition[];
  exported: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface PropertyDefinition {
  name: string;
  type: string;
  optional: boolean;
  readonly: boolean;
  jsdoc?: string;
}

export interface ClassDefinition {
  name: string;
  extends?: string;
  implements?: string[];
  properties: PropertyDefinition[];
  methods: MethodDefinition[];
  constructor?: MethodDefinition;
  exported: boolean;
  abstract: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface FunctionDefinition {
  name: string;
  params: ParameterDefinition[];
  returnType: string;
  async: boolean;
  exported: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface MethodDefinition {
  name: string;
  params: ParameterDefinition[];
  returnType: string;
  async: boolean;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  abstract: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface ParameterDefinition {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ConstantDefinition {
  name: string;
  type: string;
  value: string;
  exported: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface ConfigDefinition {
  name: string;
  type: string;
  defaultValue?: any;
  required: boolean;
  description?: string;
}

export interface ErrorDefinition {
  name: string;
  extends?: string;
  properties: PropertyDefinition[];
  exported: boolean;
  jsdoc?: string;
  location: SourceLocation;
}

export interface ImportStatement {
  source: string;
  named: string[];
  default?: string;
  namespace?: string;
  location: SourceLocation;
}

export interface ExportStatement {
  name: string;
  kind: 'value' | 'type' | 'namespace';
  source?: string;
  location: SourceLocation;
}

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
}

// ============================================================================
// Parsed Capsule
// ============================================================================

export interface ParsedCapsule {
  metadata: CapsuleMetadata;

  analysis: {
    types: TypeDefinition[];
    interfaces: InterfaceDefinition[];
    classes: ClassDefinition[];
    functions: FunctionDefinition[];
    methods: MethodDefinition[];
    constants: ConstantDefinition[];
    configs: ConfigDefinition[];
    imports: ImportStatement[];
    dependencies: string[];
    errorTypes: ErrorDefinition[];
    exports: ExportStatement[];
  };

  complexity: {
    linesOfCode: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    estimatedMigrationHours: number;
  };

  quality: {
    hasTypes: boolean;
    hasErrors: boolean;
    hasTests: boolean;
    hasDocumentation: boolean;
    testCoverage?: number;
  };

  // Original source files
  sourceFiles: string[];
}

// ============================================================================
// Template Context
// ============================================================================

export interface TemplateContext {
  capsule: CapsuleMetadata;

  types: TypeDefinition[];
  interfaces: InterfaceDefinition[];
  classes: ClassDefinition[];
  constants: ConstantDefinition[];
  errors: ErrorDefinition[];
  functions: FunctionDefinition[];
  configs: ConfigDefinition[];

  // Helper properties
  className: string;
  packageName: string;
  analysis: {
    types: TypeDefinition[];
    interfaces: InterfaceDefinition[];
    classes: ClassDefinition[];
    functions: FunctionDefinition[];
    constants: ConstantDefinition[];
    errors?: ErrorDefinition[];
    imports: ImportStatement[];
  };
  features: {
    includeStats: boolean;
    async: boolean;
  };

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

// ============================================================================
// Generation Output
// ============================================================================

export interface GeneratedFile {
  path: string;
  content: string;
  size: number;
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationIssue {
  code: string;
  message: string;
  file?: string;
  line?: number;
  level?: ValidationLevel;
  rule?: string;
  name?: string;
}

export interface ValidationWarning {
  code?: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface ValidationChecks {
  // File structure
  hasAllFiles: boolean;
  filesNonEmpty: boolean;

  // Types
  hasTypes: boolean;
  typesCompile: boolean;

  // Errors
  hasMinimumErrors: boolean;
  errorsExtendBase: boolean;

  // Constants
  hasConstants: boolean;
  hasDefaults: boolean;

  // Utils
  hasUtils: boolean;
  utilsDocumented: boolean;

  // Service
  hasServiceClass: boolean;
  hasLifecycle: boolean;
  lifecycleAsync: boolean;

  // Index
  hasExports: boolean;
  hasCapsuleMetadata: boolean;

  // README
  hasReadme: boolean;
  hasExamples: boolean;
  hasQuickStart: boolean;

  // Code quality
  noLintErrors: boolean;
  noTypeErrors: boolean;
  followsConventions: boolean;

  // Documentation
  allPublicDocumented: boolean;
  hasApiReference: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0-100
  checks: ValidationCheck[];
  errors: ValidationIssue[];
  warnings: ValidationWarning[];
}

// ============================================================================
// Migration Report
// ============================================================================

export interface FileReport {
  filename: string;
  lines: number;
  status: 'complete' | 'partial' | 'failed';
  notes: string[];
}

export interface MigrationReport {
  capsule: CapsuleMetadata;
  status: MigrationStatus;
  mode: MigrationMode;
  timeTaken: number; // hours

  before: {
    files: number;
    lines: number;
  };

  after: {
    files: number;
    lines: number;
  };

  qualityScore: number;

  fileBreakdown: FileReport[];

  validation: ValidationResult;

  manualActionsRequired: string[];

  notes: string[];

  generatedAt: Date;
}

export interface BatchMigrationReport {
  totalCapsules: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalTimeTaken: number;
  avgQualityScore: number;
  reports: MigrationReport[];
  summary: {
    totalFiles: number;
    totalLines: number;
    avgLinesPerCapsule: number;
  };
  generatedAt: Date;
}

export interface ProgressDashboard {
  totalCapsules: number;
  processedCapsules: number;
  successCount: number;
  failedCount: number;
  inProgressCount: number;
  percentComplete: number;
  avgTimePerCapsule: number;
  estimatedTimeRemaining: number;
  currentCapsule: string;
}

// ============================================================================
// Migration Configuration
// ============================================================================

export interface CapsuleMigrationConfig {
  name: string;
  mode: MigrationMode;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface BatchMigrationConfig {
  source: string; // Source directory
  output: string; // Output directory
  capsules: CapsuleMigrationConfig[];

  options: {
    parallel: number; // Number of parallel migrations
    validateAfter: boolean;
    generateReports: boolean;
    gitCommit: boolean;
  };
}

// ============================================================================
// CLI Options
// ============================================================================

export interface AnalyzeOptions {
  output?: string; // Output file for report
  format?: 'json' | 'md' | 'text';
}

export interface GenerateOptions {
  category: string;
  template?: string;
  outputDir?: string;
}

export interface MigrateOptions {
  outputDir?: string;
  mode?: MigrationMode;
  validate?: boolean;
  dryRun?: boolean;
}

export interface BatchOptions {
  parallel?: number;
  continueOnError?: boolean;
}

export interface ValidateOptions {
  strict?: boolean;
  fix?: boolean;
  outputFormat?: 'json' | 'md' | 'text';
}

export interface ReportOptions {
  format?: 'md' | 'json' | 'html';
  output?: string;
}

// ============================================================================
// Parser Options
// ============================================================================

export interface ParserOptions {
  includeTests?: boolean;
  includePrivate?: boolean;
  calculateComplexity?: boolean;
}

// ============================================================================
// Generator Options
// ============================================================================

export interface GeneratorOptions {
  mode: MigrationMode;
  outputDir?: string;
  templateDir?: string;
  prettier?: boolean;
  eslint?: boolean;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface FileInfo {
  path: string;
  size: number;
  lines: number;
  exists: boolean;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
}

export interface CapsuleStats {
  totalFiles: number;
  totalLines: number;
  totalTypes: number;
  totalErrors: number;
  totalFunctions: number;
  totalClasses: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

export class ParserError extends MigrationError {
  constructor(message: string, details?: any) {
    super(message, 'PARSER_ERROR', details);
    this.name = 'ParserError';
  }
}

export class GeneratorError extends MigrationError {
  constructor(message: string, details?: any) {
    super(message, 'GENERATOR_ERROR', details);
    this.name = 'GeneratorError';
  }
}

export class ValidationError extends MigrationError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TemplateError extends MigrationError {
  constructor(message: string, details?: any) {
    super(message, 'TEMPLATE_ERROR', details);
    this.name = 'TemplateError';
  }
}
