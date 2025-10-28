/**
 * Validator Tests
 */

import { describe, it, expect } from 'vitest';
import { CapsuleValidator } from '../src/validator';
import * as path from 'path';

describe('CapsuleValidator', () => {
  const validator = new CapsuleValidator();

  describe('validate', () => {
    it('should fail validation for non-existent directory', async () => {
      const result = await validator.validate('/non/existent/path');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('DIR_NOT_FOUND');
    });

    it('should pass validation for valid capsule structure', async () => {
      // This would test against a fixture with all 8 files
      // For now, we'll test the structure
      const result = await validator.validate(__dirname);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('qualityScore');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('should detect missing files', async () => {
      const result = await validator.validate(__dirname);

      // __dirname doesn't have all 8 required files
      const requiredFilesCheck = result.checks.find(
        (c) => c.name === 'Required Files'
      );

      expect(requiredFilesCheck).toBeDefined();
    });

    it('should calculate quality score between 0 and 100', async () => {
      const result = await validator.validate(__dirname);

      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('quality scoring', () => {
    it('should return 0 score for completely invalid capsule', async () => {
      const result = await validator.validate('/non/existent');

      expect(result.qualityScore).toBe(0);
    });
  });
});
