/**
 * Migration Reporter
 *
 * Generates comprehensive reports for capsule migrations
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  MigrationReport,
  BatchMigrationReport,
  ValidationResult,
  ParsedCapsule,
  GenerationResult,
  ProgressDashboard,
} from '../types';

/**
 * Reporter class for generating migration reports
 */
export class MigrationReporter {
  /**
   * Generate individual capsule migration report (Markdown)
   */
  generateReport(
    capsule: ParsedCapsule,
    generationResult: GenerationResult,
    validationResult: ValidationResult,
    timeTaken: number
  ): MigrationReport {
    const report: MigrationReport = {
      capsule: capsule.metadata,
      status: generationResult.success ? 'complete' : 'failed',
      mode: 'auto', // TODO: Get from generator options
      timeTaken,
      before: {
        files: 1, // Original capsule file count
        lines: capsule.complexity.linesOfCode,
      },
      after: {
        files: generationResult.files.length,
        lines: generationResult.files.reduce(
          (sum, f) => sum + (f.content.split('\n').length || 0),
          0
        ),
      },
      qualityScore: validationResult.qualityScore,
      fileBreakdown: generationResult.files.map((file) => ({
        filename: path.basename(file.path),
        lines: file.content.split('\n').length,
        status: 'complete',
        notes: [],
      })),
      validation: validationResult,
      manualActionsRequired: generationResult.warnings,
      notes: generationResult.errors,
      generatedAt: new Date(),
    };

    return report;
  }

  /**
   * Generate report as Markdown
   */
  generateMarkdownReport(report: MigrationReport): string {
    const sections: string[] = [];

    // Title
    sections.push(`# Migration Report: ${report.capsule.name}`);
    sections.push('');

    // Metadata
    sections.push(`**Status**: ${this.getStatusEmoji(report.status)} ${report.status.toUpperCase()}`);
    sections.push(`**Mode**: ${report.mode}`);
    sections.push(`**Time Taken**: ${report.timeTaken.toFixed(2)} hours`);
    sections.push(`**Quality Score**: ${report.qualityScore}/100`);
    sections.push(`**Generated**: ${report.generatedAt.toLocaleString()}`);
    sections.push('');

    // Capsule Info
    sections.push('## Capsule Information');
    sections.push('');
    sections.push(`- **ID**: ${report.capsule.id}`);
    sections.push(`- **Category**: ${report.capsule.category}`);
    sections.push(`- **Description**: ${report.capsule.description}`);
    sections.push(`- **Version**: ${report.capsule.version}`);
    sections.push(`- **Platforms**: ${report.capsule.platforms.join(', ')}`);
    sections.push('');

    // Code Metrics
    sections.push('## Code Metrics');
    sections.push('');
    sections.push('| Metric | Before | After | Change |');
    sections.push('|--------|--------|-------|--------|');
    sections.push(
      `| Files | ${report.before.files} | ${report.after.files} | +${
        report.after.files - report.before.files
      } |`
    );
    sections.push(
      `| Lines of Code | ${report.before.lines} | ${report.after.lines} | ${
        report.after.lines > report.before.lines ? '+' : ''
      }${report.after.lines - report.before.lines} |`
    );
    sections.push('');

    // File Breakdown
    sections.push('## Generated Files');
    sections.push('');
    report.fileBreakdown.forEach((file) => {
      const statusEmoji = file.status === 'complete' ? '✅' : '⚠️';
      sections.push(`### ${statusEmoji} ${file.filename}`);
      sections.push('');
      sections.push(`- **Lines**: ${file.lines}`);
      sections.push(`- **Status**: ${file.status}`);
      if (file.notes.length > 0) {
        sections.push('- **Notes**:');
        file.notes.forEach((note) => sections.push(`  - ${note}`));
      }
      sections.push('');
    });

    // Validation Results
    sections.push('## Validation Results');
    sections.push('');
    sections.push(`**Overall**: ${report.validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    sections.push('');

    // Validation Checks
    sections.push('### Checks');
    sections.push('');
    report.validation.checks.forEach((check) => {
      const icon = check.passed ? '✅' : '❌';
      sections.push(`- ${icon} **${check.name}**: ${check.message}`);
    });
    sections.push('');

    // Errors
    if (report.validation.errors.length > 0) {
      sections.push('### ❌ Errors');
      sections.push('');
      report.validation.errors.forEach((error) => {
        sections.push(`- **${error.code}**: ${error.message}`);
        if (error.file) {
          sections.push(`  - File: ${error.file}${error.line ? `:${error.line}` : ''}`);
        }
      });
      sections.push('');
    }

    // Warnings
    if (report.validation.warnings.length > 0) {
      sections.push('### ⚠️ Warnings');
      sections.push('');
      report.validation.warnings.forEach((warning) => {
        sections.push(`- ${warning.message}`);
        if (warning.file) {
          sections.push(`  - File: ${warning.file}${warning.line ? `:${warning.line}` : ''}`);
        }
        if (warning.suggestion) {
          sections.push(`  - Suggestion: ${warning.suggestion}`);
        }
      });
      sections.push('');
    }

    // Manual Actions Required
    if (report.manualActionsRequired.length > 0) {
      sections.push('## 📋 Manual Actions Required');
      sections.push('');
      report.manualActionsRequired.forEach((action, i) => {
        sections.push(`${i + 1}. ${action}`);
      });
      sections.push('');
    }

    // Additional Notes
    if (report.notes.length > 0) {
      sections.push('## 📝 Additional Notes');
      sections.push('');
      report.notes.forEach((note) => {
        sections.push(`- ${note}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Generate batch migration report
   */
  generateBatchReport(reports: MigrationReport[]): BatchMigrationReport {
    const totalCapsules = reports.length;
    const successfulMigrations = reports.filter(
      (r) => r.status === 'complete'
    ).length;
    const failedMigrations = reports.filter((r) => r.status === 'failed').length;

    const totalTimeTaken = reports.reduce((sum, r) => sum + r.timeTaken, 0);
    const avgQualityScore =
      reports.reduce((sum, r) => sum + r.qualityScore, 0) / totalCapsules;

    const totalLinesGenerated = reports.reduce(
      (sum, r) => sum + r.after.lines,
      0
    );

    return {
      totalCapsules,
      successfulMigrations,
      failedMigrations,
      totalTimeTaken,
      avgQualityScore,
      reports,
      summary: {
        totalFiles: reports.reduce((sum, r) => sum + r.after.files, 0),
        totalLines: totalLinesGenerated,
        avgLinesPerCapsule: Math.round(totalLinesGenerated / totalCapsules),
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Generate batch report as Markdown
   */
  generateBatchMarkdownReport(batchReport: BatchMigrationReport): string {
    const sections: string[] = [];

    // Title
    sections.push('# Batch Migration Report');
    sections.push('');
    sections.push(`**Generated**: ${batchReport.generatedAt.toLocaleString()}`);
    sections.push('');

    // Summary
    sections.push('## Summary');
    sections.push('');
    sections.push(
      `- **Total Capsules**: ${batchReport.totalCapsules}`
    );
    sections.push(
      `- **Successful**: ✅ ${batchReport.successfulMigrations} (${(
        (batchReport.successfulMigrations / batchReport.totalCapsules) *
        100
      ).toFixed(1)}%)`
    );
    sections.push(
      `- **Failed**: ❌ ${batchReport.failedMigrations} (${(
        (batchReport.failedMigrations / batchReport.totalCapsules) *
        100
      ).toFixed(1)}%)`
    );
    sections.push(
      `- **Total Time**: ${batchReport.totalTimeTaken.toFixed(2)} hours`
    );
    sections.push(
      `- **Avg Quality Score**: ${batchReport.avgQualityScore.toFixed(1)}/100`
    );
    sections.push('');

    // Statistics
    sections.push('## Statistics');
    sections.push('');
    sections.push(
      `- **Total Files Generated**: ${batchReport.summary.totalFiles}`
    );
    sections.push(
      `- **Total Lines Generated**: ${batchReport.summary.totalLines.toLocaleString()}`
    );
    sections.push(
      `- **Avg Lines per Capsule**: ${batchReport.summary.avgLinesPerCapsule.toLocaleString()}`
    );
    sections.push('');

    // Individual Reports Table
    sections.push('## Migration Results');
    sections.push('');
    sections.push('| Capsule | Status | Mode | Time (h) | Quality | Files | Lines |');
    sections.push('|---------|--------|------|----------|---------|-------|-------|');

    batchReport.reports.forEach((report) => {
      const status = this.getStatusEmoji(report.status);
      sections.push(
        `| ${report.capsule.name} | ${status} ${report.status} | ${
          report.mode
        } | ${report.timeTaken.toFixed(2)} | ${report.qualityScore}/100 | ${
          report.after.files
        } | ${report.after.lines} |`
      );
    });
    sections.push('');

    // Failed Migrations Detail
    const failedReports = batchReport.reports.filter(
      (r) => r.status === 'failed'
    );
    if (failedReports.length > 0) {
      sections.push('## Failed Migrations Detail');
      sections.push('');
      failedReports.forEach((report) => {
        sections.push(`### ❌ ${report.capsule.name}`);
        sections.push('');
        if (report.notes.length > 0) {
          sections.push('**Errors**:');
          report.notes.forEach((note) => sections.push(`- ${note}`));
          sections.push('');
        }
      });
    }

    return sections.join('\n');
  }

  /**
   * Generate progress dashboard
   */
  generateProgressDashboard(
    totalCapsules: number,
    processedCapsules: number,
    reports: MigrationReport[]
  ): ProgressDashboard {
    const successCount = reports.filter((r) => r.status === 'complete').length;
    const failedCount = reports.filter((r) => r.status === 'failed').length;
    const inProgressCount = processedCapsules - reports.length;

    const avgTimePerCapsule =
      reports.length > 0
        ? reports.reduce((sum, r) => sum + r.timeTaken, 0) / reports.length
        : 0;

    const estimatedTimeRemaining =
      avgTimePerCapsule * (totalCapsules - processedCapsules);

    return {
      totalCapsules,
      processedCapsules,
      successCount,
      failedCount,
      inProgressCount,
      percentComplete: (processedCapsules / totalCapsules) * 100,
      avgTimePerCapsule,
      estimatedTimeRemaining,
      currentCapsule: reports[reports.length - 1]?.capsule.name || 'N/A',
    };
  }

  /**
   * Save report to file
   */
  async saveReport(
    report: string,
    outputPath: string,
    format: 'md' | 'json' = 'md'
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report, 'utf-8');
  }

  /**
   * Save batch report to file
   */
  async saveBatchReport(
    batchReport: BatchMigrationReport,
    outputDir: string
  ): Promise<void> {
    // Save markdown report
    const mdReport = this.generateBatchMarkdownReport(batchReport);
    const mdPath = path.join(outputDir, 'batch-migration-report.md');
    await this.saveReport(mdReport, mdPath);

    // Save JSON report
    const jsonPath = path.join(outputDir, 'batch-migration-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(batchReport, null, 2), 'utf-8');

    // Save individual reports
    const reportsDir = path.join(outputDir, 'individual-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    for (const report of batchReport.reports) {
      const mdContent = this.generateMarkdownReport(report);
      const filename = `${report.capsule.id}-migration-report.md`;
      const reportPath = path.join(reportsDir, filename);
      await this.saveReport(mdContent, reportPath);
    }
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(
    status: 'pending' | 'in_progress' | 'complete' | 'failed'
  ): string {
    switch (status) {
      case 'complete':
        return '✅';
      case 'failed':
        return '❌';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  }
}

/**
 * Convenience functions
 */
export function createReporter(): MigrationReporter {
  return new MigrationReporter();
}

export function generateMarkdownReport(report: MigrationReport): string {
  const reporter = new MigrationReporter();
  return reporter.generateMarkdownReport(report);
}

export function generateBatchReport(
  reports: MigrationReport[]
): BatchMigrationReport {
  const reporter = new MigrationReporter();
  return reporter.generateBatchReport(reports);
}
