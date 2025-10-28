#!/usr/bin/env node

/**
 * Capsule Migration Tool - CLI
 *
 * Basic CLI implementation with migrate command
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { CapsuleParser } from '../parser';
import { CapsuleGenerator } from '../generator';
import type { GeneratorOptions, MigrationMode } from '../types';

const program = new Command();

program
  .name('capsule-migrate')
  .description('Migration tool for standardizing capsule architecture')
  .version('1.0.0');

/**
 * Migrate command - migrate a single capsule
 */
program
  .command('migrate')
  .description('Migrate a capsule to the standard 8-file architecture')
  .argument('<input>', 'Path to capsule directory to migrate')
  .argument('[output]', 'Output directory (defaults to input/migrated)')
  .option('-m, --mode <mode>', 'Migration mode: auto, semi, manual', 'auto')
  .option('--no-prettier', 'Disable prettier formatting')
  .option('--dry-run', 'Show what would be generated without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (input: string, output: string | undefined, options: any) => {
    try {
      console.log('🚀 Capsule Migration Tool v1.0.0\n');

      // Resolve paths
      const inputPath = path.resolve(input);
      const outputPath = output
        ? path.resolve(output)
        : path.join(inputPath, '..', `${path.basename(inputPath)}-migrated`);

      // Validate input
      if (!fs.existsSync(inputPath)) {
        console.error(`❌ Error: Input path does not exist: ${inputPath}`);
        process.exit(1);
      }

      if (!fs.statSync(inputPath).isDirectory()) {
        console.error(`❌ Error: Input path is not a directory: ${inputPath}`);
        process.exit(1);
      }

      console.log(`📂 Input:  ${inputPath}`);
      console.log(`📂 Output: ${outputPath}`);
      console.log(`⚙️  Mode:   ${options.mode}`);
      console.log('');

      // Parse capsule
      console.log('📖 Parsing capsule...');
      const parser = new CapsuleParser();
      const parsedCapsule = await parser.parseCapsule(inputPath);

      console.log(`   ✅ Parsed: ${parsedCapsule.metadata.name}`);
      console.log(`   📊 LOC: ${parsedCapsule.complexity.linesOfCode}`);
      console.log(`   🔍 Complexity: ${parsedCapsule.complexity.cyclomaticComplexity.toFixed(1)}`);
      console.log(`   ⏱️  Estimated: ${parsedCapsule.complexity.estimatedMigrationHours.toFixed(1)}h`);
      console.log('');

      // Determine migration strategy
      const mode = determineMigrationMode(parsedCapsule, options.mode);
      console.log(`📋 Migration Mode: ${mode}`);
      console.log('');

      if (options.dryRun) {
        console.log('🔍 Dry run - no files will be written');
        console.log('✅ Migration plan ready');
        return;
      }

      // Generate capsule
      console.log('✨ Generating capsule files...');
      const generatorOptions: GeneratorOptions = {
        mode,
        prettier: options.prettier !== false,
        outputDir: outputPath,
      };

      const generator = new CapsuleGenerator(generatorOptions);
      const result = await generator.generate(parsedCapsule, outputPath);

      if (result.success) {
        console.log(`   ✅ Generated ${result.files.length} files:`);
        result.files.forEach((file) => {
          const relPath = path.relative(outputPath, file.path);
          const size = (file.size / 1024).toFixed(1);
          console.log(`      • ${relPath} (${size} KB)`);
        });
        console.log('');

        // Show warnings if any
        if (result.warnings.length > 0) {
          console.log('⚠️  Warnings:');
          result.warnings.forEach((warning) => console.log(`   • ${warning}`));
          console.log('');
        }

        console.log('✅ Migration completed successfully!');
        console.log(`📂 Output directory: ${outputPath}`);
        console.log('');
        console.log('Next steps:');
        console.log('  1. Review the generated files');
        console.log('  2. Run TypeScript compiler: tsc --noEmit');
        console.log('  3. Run tests');
        console.log('  4. Update imports in dependent files');
      } else {
        console.error('❌ Migration failed:');
        result.errors.forEach((error) => console.error(`   • ${error}`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * Analyze command - analyze a capsule without migrating
 */
program
  .command('analyze')
  .description('Analyze a capsule and show migration recommendations')
  .argument('<input>', 'Path to capsule directory')
  .option('-v, --verbose', 'Verbose output')
  .action(async (input: string, options: any) => {
    try {
      console.log('🔍 Analyzing capsule...\n');

      const inputPath = path.resolve(input);

      if (!fs.existsSync(inputPath)) {
        console.error(`❌ Error: Path does not exist: ${inputPath}`);
        process.exit(1);
      }

      // Parse capsule
      const parser = new CapsuleParser();
      const parsedCapsule = await parser.parseCapsule(inputPath);

      // Display analysis
      console.log('📊 Capsule Analysis\n');
      console.log(`Name:        ${parsedCapsule.metadata.name}`);
      console.log(`Category:    ${parsedCapsule.metadata.category}`);
      console.log(`Description: ${parsedCapsule.metadata.description}`);
      console.log('');

      console.log('📈 Complexity Metrics');
      console.log(`Lines of Code:          ${parsedCapsule.complexity.linesOfCode}`);
      console.log(`Cyclomatic Complexity:  ${parsedCapsule.complexity.cyclomaticComplexity.toFixed(1)}`);
      console.log(`Maintainability Index:  ${parsedCapsule.complexity.maintainabilityIndex.toFixed(1)}`);
      console.log(`Estimated Migration:    ${parsedCapsule.complexity.estimatedMigrationHours.toFixed(1)} hours`);
      console.log('');

      console.log('🔍 Code Elements');
      console.log(`Types:       ${parsedCapsule.analysis.types.length}`);
      console.log(`Interfaces:  ${parsedCapsule.analysis.interfaces.length}`);
      console.log(`Classes:     ${parsedCapsule.analysis.classes.length}`);
      console.log(`Functions:   ${parsedCapsule.analysis.functions.length}`);
      console.log(`Constants:   ${parsedCapsule.analysis.constants.length}`);
      console.log('');

      // Recommended migration mode
      const recommendedMode = determineMigrationMode(parsedCapsule, 'auto');
      console.log('💡 Recommendation');
      console.log(`Migration Mode: ${recommendedMode}`);

      if (recommendedMode === 'auto') {
        console.log('This capsule can be automatically migrated.');
      } else if (recommendedMode === 'semi') {
        console.log('This capsule requires some manual intervention.');
        console.log('The tool will generate code with TODO comments.');
      } else {
        console.log('This capsule is complex and requires manual migration.');
        console.log('Use the tool to generate a migration guide.');
      }
      console.log('');

      console.log('✅ Analysis complete');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * Batch command - migrate multiple capsules
 */
program
  .command('batch')
  .description('Migrate multiple capsules in batch')
  .argument('<input-dir>', 'Directory containing capsules')
  .argument('[output-dir]', 'Output directory (defaults to input/migrated)')
  .option('-p, --parallel <number>', 'Number of parallel migrations', '3')
  .option('-m, --mode <mode>', 'Migration mode: auto, semi, manual', 'auto')
  .option('--no-prettier', 'Disable prettier formatting')
  .option('--no-reports', 'Disable report generation')
  .option('--stop-on-error', 'Stop on first error')
  .option('-v, --verbose', 'Verbose output')
  .action(async (inputDir: string, outputDir: string | undefined, options: any) => {
    try {
      console.log('🚀 Batch Migration Tool v1.0.0\n');

      // Import batch orchestrator
      const { runBatchMigration, findCapsuleDirs } = await import('../batch');

      // Resolve paths
      const inputPath = path.resolve(inputDir);
      const outputPath = outputDir
        ? path.resolve(outputDir)
        : path.join(inputPath, '..', 'migrated');

      // Find capsule directories
      console.log(`📂 Scanning: ${inputPath}`);
      const capsuleDirs = findCapsuleDirs(inputPath);

      if (capsuleDirs.length === 0) {
        console.error('❌ No capsule directories found');
        process.exit(1);
      }

      console.log(`   Found ${capsuleDirs.length} capsules`);
      console.log('');

      // Run batch migration
      const batchReport = await runBatchMigration({
        inputDirs: capsuleDirs,
        outputBaseDir: outputPath,
        parallel: parseInt(options.parallel) || 3,
        mode: options.mode,
        prettier: options.prettier !== false,
        generateReports: options.reports !== false,
        stopOnError: options.stopOnError || false,
      });

      // Exit with appropriate code
      if (batchReport.failedMigrations > 0) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Batch migration failed:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * Determine migration mode based on capsule complexity
 */
function determineMigrationMode(
  parsedCapsule: any,
  requestedMode: string
): MigrationMode {
  const { linesOfCode, cyclomaticComplexity } = parsedCapsule.complexity;

  // Auto migration criteria
  if (linesOfCode < 500 && cyclomaticComplexity < 10) {
    return 'auto';
  }

  // Manual migration criteria
  if (linesOfCode > 2000 || cyclomaticComplexity > 30) {
    if (requestedMode === 'auto') {
      console.log(
        '⚠️  Warning: Capsule is complex. Recommended mode: manual'
      );
      console.log('   Continuing with requested mode: auto');
    }
    return requestedMode === 'manual' ? 'manual' : 'semi';
  }

  // Default to semi-automatic
  return 'semi';
}

// Parse command line arguments
program.parse();
