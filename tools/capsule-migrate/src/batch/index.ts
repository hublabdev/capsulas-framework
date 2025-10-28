/**
 * Batch Migration Orchestrator
 *
 * Migrates multiple capsules in parallel with progress tracking
 */

import * as fs from 'fs';
import * as path from 'path';
import { CapsuleParser } from '../parser';
import { CapsuleGenerator } from '../generator';
import { CapsuleValidator } from '../validator';
import { MigrationReporter } from '../reporter';
import type {
  GeneratorOptions,
  MigrationReport,
  BatchMigrationReport,
  ProgressDashboard,
} from '../types';

export interface BatchMigrationConfig {
  inputDirs: string[];
  outputBaseDir: string;
  parallel?: number;
  mode?: 'auto' | 'semi' | 'manual';
  prettier?: boolean;
  generateReports?: boolean;
  stopOnError?: boolean;
}

export class BatchMigrationOrchestrator {
  private parser: CapsuleParser;
  private reporter: MigrationReporter;
  private reports: MigrationReport[] = [];
  private startTime: Date = new Date();

  constructor(private config: BatchMigrationConfig) {
    this.parser = new CapsuleParser();
    this.reporter = new MigrationReporter();
  }

  /**
   * Run batch migration
   */
  async run(): Promise<BatchMigrationReport> {
    console.log('🚀 Starting Batch Migration');
    console.log(`📂 Migrating ${this.config.inputDirs.length} capsules`);
    console.log(`🔧 Mode: ${this.config.mode || 'auto'}`);
    console.log(`⚡ Parallel: ${this.config.parallel || 1}`);
    console.log('');

    const parallel = this.config.parallel || 1;
    const capsules = this.config.inputDirs;

    // Process in batches
    for (let i = 0; i < capsules.length; i += parallel) {
      const batch = capsules.slice(i, i + parallel);

      console.log(
        `\n📦 Batch ${Math.floor(i / parallel) + 1}/${Math.ceil(
          capsules.length / parallel
        )} (${batch.length} capsules)`
      );

      // Process batch in parallel
      const promises = batch.map((capsulePath) =>
        this.migrateCapsule(capsulePath)
      );

      const results = await Promise.allSettled(promises);

      // Handle results
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled' && result.value) {
          this.reports.push(result.value);
        } else if (result.status === 'rejected') {
          console.error(`❌ Failed: ${batch[j]} - ${result.reason}`);

          if (this.config.stopOnError) {
            throw new Error(`Migration failed for ${batch[j]}: ${result.reason}`);
          }
        }
      }

      // Show progress
      this.showProgress(i + batch.length, capsules.length);
    }

    // Generate final report
    const batchReport = this.reporter.generateBatchReport(this.reports);

    if (this.config.generateReports) {
      await this.reporter.saveBatchReport(
        batchReport,
        path.join(this.config.outputBaseDir, 'reports')
      );
    }

    this.showFinalSummary(batchReport);

    return batchReport;
  }

  /**
   * Migrate a single capsule
   */
  private async migrateCapsule(
    inputPath: string
  ): Promise<MigrationReport | null> {
    const capsuleName = path.basename(inputPath);
    const startTime = Date.now();

    try {
      console.log(`   🔄 ${capsuleName}...`);

      // Parse capsule
      const parsedCapsule = await this.parser.parseCapsule(inputPath);

      // Determine output directory
      const outputDir = path.join(
        this.config.outputBaseDir,
        parsedCapsule.metadata.id
      );

      // Generate capsule
      const generatorOptions: GeneratorOptions = {
        mode: this.config.mode || 'auto',
        outputDir,
        prettier: this.config.prettier !== false,
      };

      const generator = new CapsuleGenerator(generatorOptions);
      const generationResult = await generator.generate(
        parsedCapsule,
        outputDir
      );

      if (!generationResult.success) {
        console.log(`   ❌ ${capsuleName} - Generation failed`);
        return null;
      }

      // Validate generated capsule
      const validator = new CapsuleValidator();
      const validationResult = await validator.validate(outputDir);

      // Calculate time taken
      const timeTaken = (Date.now() - startTime) / (1000 * 60 * 60); // hours

      // Generate report
      const report = this.reporter.generateReport(
        parsedCapsule,
        generationResult,
        validationResult,
        timeTaken
      );

      const statusIcon = report.status === 'complete' ? '✅' : '⚠️';
      console.log(
        `   ${statusIcon} ${capsuleName} - ${report.qualityScore}/100 (${timeTaken.toFixed(
          2
        )}h)`
      );

      return report;
    } catch (error: any) {
      console.log(`   ❌ ${capsuleName} - ${error.message}`);
      return null;
    }
  }

  /**
   * Show progress during migration
   */
  private showProgress(processed: number, total: number): void {
    const percentComplete = (processed / total) * 100;
    const progressBar = this.generateProgressBar(percentComplete, 30);

    console.log('');
    console.log(`Progress: ${progressBar} ${percentComplete.toFixed(1)}%`);
    console.log(`Completed: ${processed}/${total}`);
  }

  /**
   * Generate progress bar
   */
  private generateProgressBar(percent: number, width: number): string {
    const filled = Math.floor((percent / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * Show final summary
   */
  private showFinalSummary(batchReport: BatchMigrationReport): void {
    const duration = (Date.now() - this.startTime.getTime()) / (1000 * 60); // minutes

    console.log('\n═══════════════════════════════════════');
    console.log('   📊 BATCH MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════\n');

    console.log(`✅ Successful: ${batchReport.successfulMigrations}/${batchReport.totalCapsules}`);
    console.log(`❌ Failed: ${batchReport.failedMigrations}/${batchReport.totalCapsules}`);
    console.log(`⏱️  Duration: ${duration.toFixed(1)} minutes`);
    console.log(`📈 Avg Quality: ${batchReport.avgQualityScore.toFixed(1)}/100`);
    console.log(`📝 Total Lines: ${batchReport.summary.totalLines.toLocaleString()}`);
    console.log('');

    if (this.config.generateReports) {
      const reportsPath = path.join(this.config.outputBaseDir, 'reports');
      console.log(`📄 Reports saved to: ${reportsPath}`);
      console.log('');
    }
  }

  /**
   * Get current progress dashboard
   */
  getProgressDashboard(): ProgressDashboard {
    return this.reporter.generateProgressDashboard(
      this.config.inputDirs.length,
      this.reports.length,
      this.reports
    );
  }
}

/**
 * Convenience function to run batch migration
 */
export async function runBatchMigration(
  config: BatchMigrationConfig
): Promise<BatchMigrationReport> {
  const orchestrator = new BatchMigrationOrchestrator(config);
  return orchestrator.run();
}

/**
 * Find all capsule directories in a path
 */
export function findCapsuleDirs(basePath: string): string[] {
  const capsuleDirs: string[] = [];

  if (!fs.existsSync(basePath)) {
    return capsuleDirs;
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(basePath, entry.name);

      // Check if it looks like a capsule directory
      // (contains TypeScript files or index.ts)
      const files = fs.readdirSync(fullPath);
      const hasTsFiles = files.some(f => f.endsWith('.ts'));
      const hasIndexTs = files.includes('index.ts');

      if (hasTsFiles || hasIndexTs) {
        capsuleDirs.push(fullPath);
      }
    }
  }

  return capsuleDirs;
}
