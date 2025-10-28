/**
 * Validator Capsule - Service
 */

import type { ValidationSchema, ValidatorConfig, ValidationResult, ValidationStats } from './types';
import { ValidationAdapter } from './adapters';
import { INITIAL_STATS } from './constants';

export class ValidatorService {
  private adapter: ValidationAdapter;
  private config: ValidatorConfig;
  private stats: ValidationStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(config: ValidatorConfig = {}) {
    this.config = config;
    this.adapter = new ValidationAdapter();
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async validate(data: any, schema: ValidationSchema): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: any[] = [];

    for (const [field, validation] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors = await this.adapter.validateField(field, value, validation);
      errors.push(...fieldErrors);

      if (this.config.abortEarly && fieldErrors.length > 0) {
        break;
      }
    }

    const duration = Date.now() - startTime;
    this.updateStats(errors.length === 0, duration);

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : undefined,
    };
  }

  private updateStats(passed: boolean, duration: number): void {
    this.stats.totalValidations++;
    if (passed) {
      this.stats.passed++;
    } else {
      this.stats.failed++;
    }
    this.stats.averageTime =
      (this.stats.averageTime * (this.stats.totalValidations - 1) + duration) /
      this.stats.totalValidations;
  }

  getStats(): ValidationStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<ValidatorConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

export async function createValidatorService(config?: ValidatorConfig): Promise<ValidatorService> {
  const service = new ValidatorService(config);
  await service.initialize();
  return service;
}
