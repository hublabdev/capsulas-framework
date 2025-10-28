/**
 * Capsule Generator - Generates standardized 8-file capsule structure
 * @module capsule-migrate/generator
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ParsedCapsule,
  GenerationResult,
  GeneratedFile,
  GeneratorOptions,
  TemplateContext,
  MigrationMode,
  GeneratorError,
} from '../types';
import { generateTypes } from './generators/types';
import { generateErrors } from './generators/errors';
import { generateConstants } from './generators/constants';
import { generateUtils } from './generators/utils';
import { generateAdapters } from './generators/adapters';
import { generateService } from './generators/service';
import { generateIndex } from './generators/index-gen';
import { generateReadme } from './generators/readme';

/**
 * Main generator class for creating capsules
 */
export class CapsuleGenerator {
  constructor(private options: GeneratorOptions) {}

  /**
   * Generate capsule from parsed data
   */
  async generate(
    parsedCapsule: ParsedCapsule,
    outputDir: string
  ): Promise<GenerationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Build template context
      const context = this.buildContext(parsedCapsule);

      // Generate all 8 files
      const generators = [
        { name: 'types.ts', generator: generateTypes },
        { name: 'errors.ts', generator: generateErrors },
        { name: 'constants.ts', generator: generateConstants },
        { name: 'utils.ts', generator: generateUtils },
        { name: 'adapters.ts', generator: generateAdapters },
        { name: 'service.ts', generator: generateService },
        { name: 'index.ts', generator: generateIndex },
        { name: 'README.md', generator: generateReadme },
      ];

      for (const { name, generator } of generators) {
        try {
          const content = await generator(context, this.options);
          const filePath = path.join(outputDir, name);

          // Format with prettier if enabled
          const formattedContent = this.options.prettier
            ? await this.formatCode(content, name)
            : content;

          // Write file
          fs.writeFileSync(filePath, formattedContent, 'utf-8');

          files.push({
            path: filePath,
            content: formattedContent,
            size: Buffer.byteLength(formattedContent, 'utf-8'),
          });
        } catch (error: any) {
          errors.push(`Failed to generate ${name}: ${error.message}`);
        }
      }

      return {
        success: errors.length === 0,
        files,
        errors,
        warnings,
      };
    } catch (error: any) {
      throw new GeneratorError(`Generation failed: ${error.message}`, {
        capsule: parsedCapsule.metadata.id,
        error,
      });
    }
  }

  /**
   * Build template context from parsed capsule
   */
  private buildContext(parsedCapsule: ParsedCapsule): TemplateContext {
    const { metadata, analysis } = parsedCapsule;

    // Generate className and packageName
    const className = metadata.name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const packageName = `@capsulas/${metadata.id}`;

    // Detect features
    const hasFileSystem = analysis.imports.some(
      (i) => i.source === 'fs' || i.source === 'fs/promises'
    );

    const hasNetwork = analysis.imports.some(
      (i) =>
        i.source === 'http' ||
        i.source === 'https' ||
        i.source === 'axios' ||
        i.source === 'fetch'
    );

    const hasDatabase = analysis.imports.some(
      (i) =>
        i.source.includes('sql') ||
        i.source.includes('mongo') ||
        i.source.includes('redis')
    );

    const isMultiPlatform = metadata.platforms.length > 1;

    return {
      capsule: metadata,
      types: analysis.types,
      interfaces: analysis.interfaces,
      classes: analysis.classes,
      constants: analysis.constants,
      errors: analysis.errorTypes,
      functions: analysis.functions,
      configs: analysis.configs,
      className,
      packageName,
      analysis: {
        types: analysis.types,
        interfaces: analysis.interfaces,
        classes: analysis.classes,
        functions: analysis.functions,
        constants: analysis.constants,
        errors: analysis.errorTypes,
        imports: analysis.imports,
      },
      features: {
        includeStats: true,
        async: analysis.functions.some((f) => f.async),
      },
      hasFileSystem,
      hasNetwork,
      hasDatabase,
      isMultiPlatform,
      generatedDate: new Date().toISOString(),
      generatedBy: 'capsule-migrate tool',
      migrationNotes: [],
    };
  }

  /**
   * Format code with prettier
   */
  private async formatCode(
    content: string,
    filename: string
  ): Promise<string> {
    try {
      // Dynamic import prettier
      const prettier = await import('prettier');

      const parser = filename.endsWith('.md')
        ? 'markdown'
        : filename.endsWith('.ts')
        ? 'typescript'
        : 'babel';

      return prettier.format(content, {
        parser,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2,
      });
    } catch (error) {
      // Return unformatted if prettier fails
      return content;
    }
  }
}

/**
 * Convenience function to generate a capsule
 */
export async function generateCapsule(
  parsedCapsule: ParsedCapsule,
  outputDir: string,
  options: GeneratorOptions
): Promise<GenerationResult> {
  const generator = new CapsuleGenerator(options);
  return generator.generate(parsedCapsule, outputDir);
}

// Export individual generators
export * from './generators/types';
export * from './generators/errors';
export * from './generators/constants';
export * from './generators/utils';
export * from './generators/adapters';
export * from './generators/service';
export * from './generators/index-gen';
export * from './generators/readme';
