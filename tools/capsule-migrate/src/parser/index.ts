/**
 * Capsule Parser - Analyzes existing capsule code structures
 * @module capsule-migrate/parser
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {
  ParsedCapsule,
  CapsuleMetadata,
  TypeDefinition,
  InterfaceDefinition,
  ClassDefinition,
  FunctionDefinition,
  MethodDefinition,
  ConstantDefinition,
  ErrorDefinition,
  ImportStatement,
  ExportStatement,
  ParserOptions,
  ParserError,
  SourceLocation,
  PropertyDefinition,
  ParameterDefinition,
} from '../types';

/**
 * Main parser class for analyzing capsule code
 */
export class CapsuleParser {
  private sourceFiles: ts.SourceFile[] = [];
  private program!: ts.Program;
  private checker!: ts.TypeChecker;

  constructor(private options: ParserOptions = {}) {}

  /**
   * Parse a capsule from a directory
   */
  async parseCapsule(capsulePath: string): Promise<ParsedCapsule> {
    if (!fs.existsSync(capsulePath)) {
      throw new ParserError(`Capsule path does not exist: ${capsulePath}`);
    }

    // Find all TypeScript files
    const tsFiles = this.findTypeScriptFiles(capsulePath);

    if (tsFiles.length === 0) {
      throw new ParserError(`No TypeScript files found in: ${capsulePath}`);
    }

    // Create TypeScript program
    this.program = ts.createProgram(tsFiles, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      strict: true,
      allowJs: false,
    });

    this.checker = this.program.getTypeChecker();

    // Parse each file
    for (const file of tsFiles) {
      const sourceFile = this.program.getSourceFile(file);
      if (sourceFile) {
        this.sourceFiles.push(sourceFile);
      }
    }

    // Extract metadata
    const metadata = await this.extractMetadata(capsulePath);

    // Analyze code
    const analysis = this.analyzeCode();

    // Calculate complexity
    const complexity = this.calculateComplexity();

    // Assess quality
    const quality = this.assessQuality();

    return {
      metadata,
      analysis,
      complexity,
      quality,
      sourceFiles: tsFiles,
    };
  }

  /**
   * Find all TypeScript files in directory
   */
  private findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and test directories unless specified
          if (
            entry.name === 'node_modules' ||
            entry.name === 'dist' ||
            entry.name === 'build'
          ) {
            continue;
          }

          if (!this.options.includeTests && entry.name.includes('test')) {
            continue;
          }

          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          // Skip test files unless specified
          if (
            !this.options.includeTests &&
            (entry.name.endsWith('.test.ts') ||
              entry.name.endsWith('.spec.ts'))
          ) {
            continue;
          }

          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Extract capsule metadata
   */
  private async extractMetadata(
    capsulePath: string
  ): Promise<CapsuleMetadata> {
    // Try to find package.json
    const packageJsonPath = path.join(capsulePath, 'package.json');
    let packageJson: any = {};

    if (fs.existsSync(packageJsonPath)) {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    }

    // Extract capsule name from path or package.json
    const name =
      packageJson.name || path.basename(capsulePath).replace('capsule-', '');

    // Default metadata
    return {
      id: this.toCapsuleId(name),
      name: this.toCapitalized(name),
      category: this.inferCategory(capsulePath),
      description: packageJson.description || `${name} capsule`,
      version: packageJson.version || '1.0.0',
      platforms: ['node'], // Default, can be inferred from code
      dependencies: Object.keys(packageJson.dependencies || {}),
      author: packageJson.author,
      license: packageJson.license,
    };
  }

  /**
   * Analyze code structure
   */
  private analyzeCode() {
    const types: TypeDefinition[] = [];
    const interfaces: InterfaceDefinition[] = [];
    const classes: ClassDefinition[] = [];
    const functions: FunctionDefinition[] = [];
    const constants: ConstantDefinition[] = [];
    const errorTypes: ErrorDefinition[] = [];
    const imports: ImportStatement[] = [];
    const exports: ExportStatement[] = [];

    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, (node) => {
        // Type aliases
        if (ts.isTypeAliasDeclaration(node)) {
          types.push(this.extractTypeAlias(node, sourceFile));
        }

        // Interfaces
        if (ts.isInterfaceDeclaration(node)) {
          interfaces.push(this.extractInterface(node, sourceFile));
        }

        // Classes
        if (ts.isClassDeclaration(node)) {
          const classDef = this.extractClass(node, sourceFile);
          classes.push(classDef);

          // Check if it's an error class
          if (this.isErrorClass(node)) {
            errorTypes.push(this.extractErrorClass(node, sourceFile));
          }
        }

        // Functions
        if (ts.isFunctionDeclaration(node)) {
          functions.push(this.extractFunction(node, sourceFile));
        }

        // Variables/Constants
        if (ts.isVariableStatement(node)) {
          constants.push(...this.extractConstants(node, sourceFile));
        }

        // Imports
        if (ts.isImportDeclaration(node)) {
          imports.push(this.extractImport(node, sourceFile));
        }

        // Exports
        if (ts.isExportDeclaration(node) || this.hasExportModifier(node)) {
          exports.push(...this.extractExports(node, sourceFile));
        }
      });
    }

    return {
      types,
      interfaces,
      classes,
      functions,
      methods: [], // Extracted from classes
      constants,
      configs: this.extractConfigs(interfaces, constants),
      imports,
      dependencies: this.extractDependencies(imports),
      errorTypes,
      exports,
    };
  }

  /**
   * Extract type alias
   */
  private extractTypeAlias(
    node: ts.TypeAliasDeclaration,
    sourceFile: ts.SourceFile
  ): TypeDefinition {
    return {
      name: node.name.text,
      kind: 'type',
      definition: node.type.getText(sourceFile),
      exported: this.hasExportModifier(node),
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract interface
   */
  private extractInterface(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile
  ): InterfaceDefinition {
    const properties: PropertyDefinition[] = [];

    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) {
        properties.push({
          name: member.name.getText(sourceFile),
          type: member.type?.getText(sourceFile) || 'any',
          optional: !!member.questionToken,
          readonly: member.modifiers?.some(
            (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword
          ) || false,
          jsdoc: this.getJSDoc(member),
        });
      }
    }

    return {
      name: node.name.text,
      extends: node.heritageClauses
        ?.filter((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
        .flatMap((h) => h.types.map((t) => t.expression.getText(sourceFile))),
      properties,
      exported: this.hasExportModifier(node),
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract class
   */
  private extractClass(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): ClassDefinition {
    const properties: PropertyDefinition[] = [];
    const methods: MethodDefinition[] = [];
    let constructor: MethodDefinition | undefined;

    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && member.name) {
        properties.push({
          name: member.name.getText(sourceFile),
          type: member.type?.getText(sourceFile) || 'any',
          optional: !!member.questionToken,
          readonly:
            member.modifiers?.some(
              (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword
            ) || false,
          jsdoc: this.getJSDoc(member),
        });
      }

      if (ts.isMethodDeclaration(member) && member.name) {
        methods.push(this.extractMethod(member, sourceFile));
      }

      if (ts.isConstructorDeclaration(member)) {
        constructor = this.extractConstructor(member, sourceFile);
      }
    }

    return {
      name: node.name?.text || 'Anonymous',
      extends: node.heritageClauses
        ?.filter((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
        .flatMap((h) =>
          h.types.map((t) => t.expression.getText(sourceFile))
        )[0],
      implements: node.heritageClauses
        ?.filter((h) => h.token === ts.SyntaxKind.ImplementsKeyword)
        .flatMap((h) => h.types.map((t) => t.expression.getText(sourceFile))),
      properties,
      methods,
      constructor,
      exported: this.hasExportModifier(node),
      abstract:
        node.modifiers?.some(
          (m) => m.kind === ts.SyntaxKind.AbstractKeyword
        ) || false,
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract method
   */
  private extractMethod(
    node: ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ): MethodDefinition {
    return {
      name: node.name.getText(sourceFile),
      params: this.extractParameters(node.parameters, sourceFile),
      returnType: node.type?.getText(sourceFile) || 'void',
      async: node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.AsyncKeyword
      ) || false,
      visibility: this.getVisibility(node),
      static: node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.StaticKeyword
      ) || false,
      abstract: node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.AbstractKeyword
      ) || false,
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract constructor
   */
  private extractConstructor(
    node: ts.ConstructorDeclaration,
    sourceFile: ts.SourceFile
  ): MethodDefinition {
    return {
      name: 'constructor',
      params: this.extractParameters(node.parameters, sourceFile),
      returnType: 'void',
      async: false,
      visibility: 'public',
      static: false,
      abstract: false,
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract function
   */
  private extractFunction(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile
  ): FunctionDefinition {
    return {
      name: node.name?.text || 'anonymous',
      params: this.extractParameters(node.parameters, sourceFile),
      returnType: node.type?.getText(sourceFile) || 'void',
      async:
        node.modifiers?.some(
          (m) => m.kind === ts.SyntaxKind.AsyncKeyword
        ) || false,
      exported: this.hasExportModifier(node),
      jsdoc: this.getJSDoc(node),
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract parameters
   */
  private extractParameters(
    params: ts.NodeArray<ts.ParameterDeclaration>,
    sourceFile: ts.SourceFile
  ): ParameterDefinition[] {
    return params.map((param) => ({
      name: param.name.getText(sourceFile),
      type: param.type?.getText(sourceFile) || 'any',
      optional: !!param.questionToken,
      defaultValue: param.initializer?.getText(sourceFile),
    }));
  }

  /**
   * Extract constants
   */
  private extractConstants(
    node: ts.VariableStatement,
    sourceFile: ts.SourceFile
  ): ConstantDefinition[] {
    const constants: ConstantDefinition[] = [];

    for (const declaration of node.declarationList.declarations) {
      if (declaration.name && ts.isIdentifier(declaration.name)) {
        constants.push({
          name: declaration.name.text,
          type: declaration.type?.getText(sourceFile) || 'any',
          value: declaration.initializer?.getText(sourceFile) || '',
          exported: this.hasExportModifier(node),
          jsdoc: this.getJSDoc(node),
          location: this.getLocation(declaration, sourceFile),
        });
      }
    }

    return constants;
  }

  /**
   * Extract error class
   */
  private extractErrorClass(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): ErrorDefinition {
    const classDef = this.extractClass(node, sourceFile);

    return {
      name: classDef.name,
      extends: classDef.extends,
      properties: classDef.properties,
      exported: classDef.exported,
      jsdoc: classDef.jsdoc,
      location: classDef.location,
    };
  }

  /**
   * Extract imports
   */
  private extractImport(
    node: ts.ImportDeclaration,
    sourceFile: ts.SourceFile
  ): ImportStatement {
    const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
    const named: string[] = [];
    let defaultImport: string | undefined;
    let namespaceImport: string | undefined;

    if (node.importClause) {
      if (node.importClause.name) {
        defaultImport = node.importClause.name.text;
      }

      if (node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          named.push(
            ...node.importClause.namedBindings.elements.map(
              (e) => e.name.text
            )
          );
        } else if (
          ts.isNamespaceImport(node.importClause.namedBindings)
        ) {
          namespaceImport = node.importClause.namedBindings.name.text;
        }
      }
    }

    return {
      source: moduleSpecifier,
      named,
      default: defaultImport,
      namespace: namespaceImport,
      location: this.getLocation(node, sourceFile),
    };
  }

  /**
   * Extract exports
   */
  private extractExports(
    node: ts.Node,
    sourceFile: ts.SourceFile
  ): ExportStatement[] {
    const exports: ExportStatement[] = [];

    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          exports.push({
            name: element.name.text,
            kind: 'value',
            source: node.moduleSpecifier
              ? (node.moduleSpecifier as ts.StringLiteral).text
              : undefined,
            location: this.getLocation(element, sourceFile),
          });
        }
      }
    } else if (this.hasExportModifier(node)) {
      const name = this.getNodeName(node);
      if (name) {
        exports.push({
          name,
          kind: this.getExportKind(node),
          location: this.getLocation(node, sourceFile),
        });
      }
    }

    return exports;
  }

  /**
   * Extract configs from interfaces and constants
   */
  private extractConfigs(
    interfaces: InterfaceDefinition[],
    constants: ConstantDefinition[]
  ) {
    const configs: any[] = [];

    // Find config interfaces (e.g., *Config, *Options)
    const configInterfaces = interfaces.filter(
      (i) =>
        i.name.endsWith('Config') ||
        i.name.endsWith('Options') ||
        i.name.endsWith('Settings')
    );

    for (const configInterface of configInterfaces) {
      for (const prop of configInterface.properties) {
        configs.push({
          name: prop.name,
          type: prop.type,
          required: !prop.optional,
          description: prop.jsdoc,
        });
      }
    }

    return configs;
  }

  /**
   * Extract dependencies from imports
   */
  private extractDependencies(imports: ImportStatement[]): string[] {
    const deps = new Set<string>();

    for (const imp of imports) {
      // External dependencies (not relative paths)
      if (!imp.source.startsWith('.') && !imp.source.startsWith('/')) {
        // Get package name (handle scoped packages)
        const pkgName = imp.source.startsWith('@')
          ? imp.source.split('/').slice(0, 2).join('/')
          : imp.source.split('/')[0];

        deps.add(pkgName);
      }
    }

    return Array.from(deps);
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexity() {
    let linesOfCode = 0;
    let cyclomaticComplexity = 0;

    for (const sourceFile of this.sourceFiles) {
      const fileContent = sourceFile.getFullText();
      const lines = fileContent.split('\n');
      linesOfCode += lines.length;

      // Calculate cyclomatic complexity (simplified)
      cyclomaticComplexity += this.calculateCyclomaticComplexity(sourceFile);
    }

    // Calculate maintainability index (simplified)
    const maintainabilityIndex = Math.max(
      0,
      (171 - 5.2 * Math.log(linesOfCode) - 0.23 * cyclomaticComplexity) *
        100 /
        171
    );

    // Estimate migration hours based on complexity
    const estimatedMigrationHours = this.estimateMigrationTime(
      linesOfCode,
      cyclomaticComplexity
    );

    return {
      linesOfCode,
      cyclomaticComplexity,
      maintainabilityIndex,
      estimatedMigrationHours,
    };
  }

  /**
   * Calculate cyclomatic complexity for a file
   */
  private calculateCyclomaticComplexity(sourceFile: ts.SourceFile): number {
    let complexity = 1; // Base complexity

    const visit = (node: ts.Node) => {
      // Count decision points
      if (
        ts.isIfStatement(node) ||
        ts.isConditionalExpression(node) ||
        ts.isForStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node) ||
        ts.isCaseClause(node) ||
        ts.isCatchClause(node)
      ) {
        complexity++;
      }

      // Count logical operators
      if (ts.isBinaryExpression(node)) {
        if (
          node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken
        ) {
          complexity++;
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return complexity;
  }

  /**
   * Estimate migration time
   */
  private estimateMigrationTime(
    linesOfCode: number,
    cyclomaticComplexity: number
  ): number {
    // Base time
    let hours = 1;

    // Add time based on lines of code
    if (linesOfCode < 200) {
      hours += 0.5;
    } else if (linesOfCode < 500) {
      hours += 1;
    } else if (linesOfCode < 1000) {
      hours += 2;
    } else {
      hours += 4;
    }

    // Add time based on complexity
    if (cyclomaticComplexity < 10) {
      hours += 0.5;
    } else if (cyclomaticComplexity < 30) {
      hours += 1;
    } else {
      hours += 2;
    }

    return Math.round(hours * 10) / 10; // Round to 1 decimal
  }

  /**
   * Assess code quality
   */
  private assessQuality() {
    const hasTypes = this.sourceFiles.some((sf) =>
      sf.statements.some((s) => ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s))
    );

    const hasErrors = this.sourceFiles.some((sf) =>
      sf.statements.some(
        (s) => ts.isClassDeclaration(s) && this.isErrorClass(s)
      )
    );

    const hasTests = false; // Would need to check for test files

    const hasDocumentation = this.sourceFiles.some((sf) =>
      sf.statements.some((s) => !!this.getJSDoc(s))
    );

    return {
      hasTypes,
      hasErrors,
      hasTests,
      hasDocumentation,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private hasExportModifier(node: ts.Node): boolean {
    return (
      ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      ) || false
    );
  }

  private getVisibility(
    node: ts.MethodDeclaration
  ): 'public' | 'private' | 'protected' {
    const modifiers = ts.getModifiers(node);
    if (modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) {
      return 'private';
    }
    if (modifiers?.some((m) => m.kind === ts.SyntaxKind.ProtectedKeyword)) {
      return 'protected';
    }
    return 'public';
  }

  private getJSDoc(node: ts.Node): string | undefined {
    const jsDocTags = (node as any).jsDoc;
    if (jsDocTags && jsDocTags.length > 0) {
      return jsDocTags[0].comment || undefined;
    }
    return undefined;
  }

  private getLocation(
    node: ts.Node,
    sourceFile: ts.SourceFile
  ): SourceLocation {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );

    return {
      file: sourceFile.fileName,
      line: line + 1,
      column: character + 1,
    };
  }

  private getNodeName(node: ts.Node): string | undefined {
    if ('name' in node && node.name && ts.isIdentifier(node.name as ts.Node)) {
      return (node.name as ts.Identifier).text;
    }
    return undefined;
  }

  private getExportKind(node: ts.Node): 'value' | 'type' | 'namespace' {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      return 'type';
    }
    if (ts.isModuleDeclaration(node)) {
      return 'namespace';
    }
    return 'value';
  }

  private isErrorClass(node: ts.ClassDeclaration): boolean {
    if (!node.heritageClauses) return false;

    for (const clause of node.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        for (const type of clause.types) {
          const typeName = type.expression.getText();
          if (typeName.includes('Error')) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private toCapsuleId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  private toCapitalized(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private inferCategory(capsulePath: string): string {
    const name = path.basename(capsulePath).toLowerCase();

    if (name.includes('auth')) return 'Authentication';
    if (name.includes('database') || name.includes('db'))
      return 'Infrastructure';
    if (name.includes('logger') || name.includes('log'))
      return 'Infrastructure';
    if (name.includes('http') || name.includes('api')) return 'API Integration';
    if (name.includes('cache')) return 'Infrastructure';
    if (name.includes('queue')) return 'Infrastructure';
    if (name.includes('email')) return 'Messaging';
    if (name.includes('payment')) return 'API Integration';
    if (name.includes('validation')) return 'Data Processing';
    if (name.includes('crypto')) return 'Cryptography';

    return 'Utilities';
  }
}

/**
 * Convenience function to parse a capsule
 */
export async function parseCapsule(
  capsulePath: string,
  options?: ParserOptions
): Promise<ParsedCapsule> {
  const parser = new CapsuleParser(options);
  return parser.parseCapsule(capsulePath);
}
