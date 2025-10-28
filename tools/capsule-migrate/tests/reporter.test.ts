/**
 * Reporter Tests
 */

import { describe, it, expect } from 'vitest';
import { MigrationReporter } from '../src/reporter';
import type { MigrationReport } from '../src/types';

describe('MigrationReporter', () => {
  const reporter = new MigrationReporter();

  const mockReport: MigrationReport = {
    capsule: {
      id: 'test-capsule',
      name: 'Test Capsule',
      category: 'test',
      description: 'A test capsule',
      version: '1.0.0',
      platforms: ['node'],
    },
    status: 'complete',
    mode: 'auto',
    timeTaken: 0.5,
    before: { files: 1, lines: 100 },
    after: { files: 8, lines: 500 },
    qualityScore: 85,
    fileBreakdown: [
      { filename: 'types.ts', lines: 50, status: 'complete', notes: [] },
      { filename: 'errors.ts', lines: 80, status: 'complete', notes: [] },
    ],
    validation: {
      isValid: true,
      qualityScore: 85,
      checks: [
        { name: 'Test Check', passed: true, message: 'Passed' },
      ],
      errors: [],
      warnings: [],
    },
    manualActionsRequired: [],
    notes: [],
    generatedAt: new Date(),
  };

  describe('generateMarkdownReport', () => {
    it('should generate a markdown report', () => {
      const markdown = reporter.generateMarkdownReport(mockReport);

      expect(markdown).toContain('# Migration Report: Test Capsule');
      expect(markdown).toContain('**Status**: ✅ COMPLETE');
      expect(markdown).toContain('## Code Metrics');
      expect(markdown).toContain('## Generated Files');
      expect(markdown).toContain('## Validation Results');
    });

    it('should include quality score', () => {
      const markdown = reporter.generateMarkdownReport(mockReport);

      expect(markdown).toContain('**Quality Score**: 85/100');
    });

    it('should show file breakdown', () => {
      const markdown = reporter.generateMarkdownReport(mockReport);

      expect(markdown).toContain('types.ts');
      expect(markdown).toContain('errors.ts');
    });
  });

  describe('generateBatchReport', () => {
    it('should aggregate multiple reports', () => {
      const reports = [mockReport, mockReport, mockReport];
      const batchReport = reporter.generateBatchReport(reports);

      expect(batchReport.totalCapsules).toBe(3);
      expect(batchReport.successfulMigrations).toBe(3);
      expect(batchReport.failedMigrations).toBe(0);
      expect(batchReport.avgQualityScore).toBe(85);
    });

    it('should calculate correct averages', () => {
      const report1 = { ...mockReport, qualityScore: 80, timeTaken: 0.5 };
      const report2 = { ...mockReport, qualityScore: 90, timeTaken: 1.0 };

      const batchReport = reporter.generateBatchReport([report1, report2]);

      expect(batchReport.avgQualityScore).toBe(85);
      expect(batchReport.totalTimeTaken).toBe(1.5);
    });
  });

  describe('generateBatchMarkdownReport', () => {
    it('should generate batch markdown', () => {
      const batchReport = reporter.generateBatchReport([mockReport]);
      const markdown = reporter.generateBatchMarkdownReport(batchReport);

      expect(markdown).toContain('# Batch Migration Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## Migration Results');
    });
  });

  describe('generateProgressDashboard', () => {
    it('should calculate progress correctly', () => {
      const dashboard = reporter.generateProgressDashboard(10, 5, [mockReport]);

      expect(dashboard.totalCapsules).toBe(10);
      expect(dashboard.processedCapsules).toBe(5);
      expect(dashboard.percentComplete).toBe(50);
    });

    it('should estimate remaining time', () => {
      const reports = [
        { ...mockReport, timeTaken: 0.5 },
        { ...mockReport, timeTaken: 0.5 },
      ];

      const dashboard = reporter.generateProgressDashboard(10, 2, reports);

      expect(dashboard.avgTimePerCapsule).toBe(0.5);
      expect(dashboard.estimatedTimeRemaining).toBe(4.0); // 8 remaining * 0.5
    });
  });
});
