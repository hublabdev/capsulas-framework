/**
 * Capsule Validator
 *
 * Validates generated capsules against the 8-file standard
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import type {
  ValidationResult,
  ValidationCheck,
  ValidationIssue,
  ValidationWarning,
} from '../types';

/**
 * Required files for a valid capsule
 */
const REQUIRED_FILES = [
  'types.ts',
  'errors.ts',
  'constants.ts',
  'utils.ts',
  'adapters.ts',
  'service.ts',
  'index.ts',
  'README.md',
];

/**
 * Capsule Validator class
 */
export class CapsuleValidator {
  /**
   * Validate a capsule directory
   */
  async validate(capsulePath: string): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    const checks: ValidationCheck[] = [];

    try {
      // Check 1: Directory exists
      const dirCheck = this.checkDirectoryExists(capsulePath);
      checks.push(dirCheck);
      if (!dirCheck.passed) {
        errors.push({
          code: 'DIR_NOT_FOUND',
          message: `Directory not found: ${capsulePath}`,
          file: capsulePath,
        });
        return this.buildResult(false, checks, errors, warnings);
      }

      // Check 2: All required files exist
      const filesCheck = this.checkRequiredFiles(capsulePath);
      checks.push(filesCheck);
      if (!filesCheck.passed) {
        filesCheck.details.missing.forEach((file: string) => {
          errors.push({
            code: 'MISSING_FILE',
            message: `Required file missing: ${file}`,
            file,
          });
        });
      }

      // Check 3: TypeScript compilation
      const tsCheck = await this.checkTypeScriptCompilation(capsulePath);
      checks.push(tsCheck);
      if (!tsCheck.passed) {
        tsCheck.details.errors.forEach((err: any) => {
          errors.push({
            code: 'TS_ERROR',
            message: err.message,
            file: err.file,
            line: err.line,
          });
        });
      }

      // Check 4: File structure validation
      const structureChecks = await this.checkFileStructure(capsulePath);
      checks.push(...structureChecks.checks);
      errors.push(...structureChecks.errors);
      warnings.push(...structureChecks.warnings);

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(checks, errors, warnings);

      return this.buildResult(errors.length === 0, checks, errors, warnings, qualityScore);
    } catch (error: any) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error.message}`,
      });
      return this.buildResult(false, checks, errors, warnings);
    }
  }

  /**
   * Check if directory exists
   */
  private checkDirectoryExists(dirPath: string): ValidationCheck {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    return {
      name: 'Directory Exists',
      passed: exists,
      message: exists ? 'Directory found' : 'Directory not found',
    };
  }

  /**
   * Check if all required files exist
   */
  private checkRequiredFiles(capsulePath: string): ValidationCheck {
    const missing: string[] = [];
    const found: string[] = [];

    for (const file of REQUIRED_FILES) {
      const filePath = path.join(capsulePath, file);
      if (fs.existsSync(filePath)) {
        found.push(file);
      } else {
        missing.push(file);
      }
    }

    return {
      name: 'Required Files',
      passed: missing.length === 0,
      message: missing.length === 0
        ? 'All required files present'
        : `Missing ${missing.length} file(s)`,
      details: { found, missing, total: REQUIRED_FILES.length },
    };
  }

  /**
   * Check TypeScript compilation
   */
  private async checkTypeScriptCompilation(
    capsulePath: string
  ): Promise<ValidationCheck> {
    try {
      // Find all TypeScript files
      const tsFiles = REQUIRED_FILES.filter((f) => f.endsWith('.ts')).map((f) =>
        path.join(capsulePath, f)
      );

      // Create TypeScript program
      const program = ts.createProgram(tsFiles, {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      });

      // Get diagnostics
      const diagnostics = ts.getPreEmitDiagnostics(program);

      if (diagnostics.length === 0) {
        return {
          name: 'TypeScript Compilation',
          passed: true,
          message: 'No TypeScript errors',
        };
      }

      // Parse errors
      const errors = diagnostics.map((diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        );
        const file = diagnostic.file
          ? path.basename(diagnostic.file.fileName)
          : 'unknown';
        const line = diagnostic.file && diagnostic.start
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1
          : 0;

        return { message, file, line };
      });

      return {
        name: 'TypeScript Compilation',
        passed: false,
        message: `${diagnostics.length} TypeScript error(s)`,
        details: { errors, count: diagnostics.length },
      };
    } catch (error: any) {
      return {
        name: 'TypeScript Compilation',
        passed: false,
        message: `Compilation check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check file structure and content
   */
  private async checkFileStructure(capsulePath: string): Promise<{
    checks: ValidationCheck[];
    errors: ValidationIssue[];
    warnings: ValidationWarning[];
  }> {
    const checks: ValidationCheck[] = [];
    const errors: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];

    // Check errors.ts - must have at least 8 error types
    const errorsCheck = this.checkErrorsFile(capsulePath);
    checks.push(errorsCheck);
    if (!errorsCheck.passed && errorsCheck.details?.count < 8) {
      warnings.push({
        code: 'INSUFFICIENT_ERRORS',
        message: `errors.ts should define at least 8 error types (found ${errorsCheck.details.count})`,
        file: 'errors.ts',
      });
    }

    // Check service.ts - must have Service class with lifecycle methods
    const serviceCheck = this.checkServiceFile(capsulePath);
    checks.push(serviceCheck);
    if (!serviceCheck.passed) {
      warnings.push({
        code: 'INVALID_SERVICE',
        message: 'service.ts should have a Service class with initialize, execute, cleanup methods',
        file: 'service.ts',
      });
    }

    // Check index.ts - must export public API
    const indexCheck = this.checkIndexFile(capsulePath);
    checks.push(indexCheck);
    if (!indexCheck.passed) {
      warnings.push({
        code: 'INVALID_INDEX',
        message: 'index.ts should export public API and capsule metadata',
        file: 'index.ts',
      });
    }

    // Check README.md - must have minimum sections
    const readmeCheck = this.checkReadmeFile(capsulePath);
    checks.push(readmeCheck);
    if (!readmeCheck.passed) {
      warnings.push({
        code: 'INCOMPLETE_README',
        message: 'README.md should have sections: Features, Quick Start, Installation, API Reference',
        file: 'README.md',
      });
    }

    return { checks, errors, warnings };
  }

  /**
   * Check errors.ts file
   */
  private checkErrorsFile(capsulePath: string): ValidationCheck {
    const filePath = path.join(capsulePath, 'errors.ts');
    if (!fs.existsSync(filePath)) {
      return {
        name: 'errors.ts Structure',
        passed: false,
        message: 'File not found',
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Count error type definitions (enum members or class definitions)
    const enumMatches = content.match(/=\s*['"][A-Z_]+['"]/g) || [];
    const classMatches = content.match(/class\s+\w+Error\s+extends/g) || [];
    const errorCount = Math.max(enumMatches.length, classMatches.length);

    const passed = errorCount >= 8;
    return {
      name: 'errors.ts Structure',
      passed,
      message: passed
        ? `Found ${errorCount} error types`
        : `Only ${errorCount} error types (minimum 8 required)`,
      details: { count: errorCount, minimum: 8 },
    };
  }

  /**
   * Check service.ts file
   */
  private checkServiceFile(capsulePath: string): ValidationCheck {
    const filePath = path.join(capsulePath, 'service.ts');
    if (!fs.existsSync(filePath)) {
      return {
        name: 'service.ts Structure',
        passed: false,
        message: 'File not found',
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const hasClass = /class\s+\w+Service/.test(content);
    const hasInitialize = /async\s+initialize\s*\(/.test(content);
    const hasExecute = /async\s+execute\s*\(/.test(content);
    const hasCleanup = /async\s+cleanup\s*\(/.test(content);
    const hasGetStats = /getStats\s*\(/.test(content);

    const passed = hasClass && hasInitialize && hasExecute && hasCleanup;

    return {
      name: 'service.ts Structure',
      passed,
      message: passed
        ? 'Service class with lifecycle methods found'
        : 'Missing Service class or lifecycle methods',
      details: { hasClass, hasInitialize, hasExecute, hasCleanup, hasGetStats },
    };
  }

  /**
   * Check index.ts file
   */
  private checkIndexFile(capsulePath: string): ValidationCheck {
    const filePath = path.join(capsulePath, 'index.ts');
    if (!fs.existsSync(filePath)) {
      return {
        name: 'index.ts Structure',
        passed: false,
        message: 'File not found',
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExports = /export\s+\*\s+from/.test(content);
    const hasCapsuleMetadata = /export\s+const\s+\w+Capsule\s*=/.test(content);
    const hasFactoryFunction = /export\s+(function|const)\s+create\w+/.test(content);

    const passed = hasExports && hasCapsuleMetadata;

    return {
      name: 'index.ts Structure',
      passed,
      message: passed ? 'Public API exports found' : 'Missing public API exports',
      details: { hasExports, hasCapsuleMetadata, hasFactoryFunction },
    };
  }

  /**
   * Check README.md file
   */
  private checkReadmeFile(capsulePath: string): ValidationCheck {
    const filePath = path.join(capsulePath, 'README.md');
    if (!fs.existsSync(filePath)) {
      return {
        name: 'README.md Structure',
        passed: false,
        message: 'File not found',
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFeatures = /##\s+Features/.test(content);
    const hasQuickStart = /##\s+Quick Start/.test(content);
    const hasInstallation = /##\s+Installation/.test(content);
    const hasApiReference = /##\s+API Reference/.test(content);

    const requiredSections = [hasFeatures, hasQuickStart, hasInstallation, hasApiReference];
    const foundSections = requiredSections.filter(Boolean).length;
    const passed = foundSections >= 4;

    return {
      name: 'README.md Structure',
      passed,
      message: passed
        ? 'All required sections present'
        : `Missing sections (${foundSections}/4)`,
      details: { hasFeatures, hasQuickStart, hasInstallation, hasApiReference },
    };
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(
    checks: ValidationCheck[],
    errors: ValidationIssue[],
    warnings: ValidationWarning[]
  ): number {
    const passedChecks = checks.filter((c) => c.passed).length;
    const totalChecks = checks.length;

    if (totalChecks === 0) return 0;

    // Base score from passed checks (0-100)
    let score = (passedChecks / totalChecks) * 100;

    // Deduct for errors (up to -30 points)
    score -= Math.min(errors.length * 5, 30);

    // Deduct for warnings (up to -20 points)
    score -= Math.min(warnings.length * 2, 20);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Build validation result
   */
  private buildResult(
    isValid: boolean,
    checks: ValidationCheck[],
    errors: ValidationIssue[],
    warnings: ValidationWarning[],
    qualityScore: number = 0
  ): ValidationResult {
    return {
      isValid,
      qualityScore,
      checks,
      errors,
      warnings,
    };
  }
}

/**
 * Convenience function to validate a capsule
 */
export async function validateCapsule(
  capsulePath: string
): Promise<ValidationResult> {
  const validator = new CapsuleValidator();
  return validator.validate(capsulePath);
}
