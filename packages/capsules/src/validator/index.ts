/**
 * @capsulas/capsules - Validator Capsule
 *
 * Data validation with schema support
 *
 * @category Utilities
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { ValidationAdapter } from './adapters';
export { ValidatorService, createValidatorService } from './service';

import { ValidatorService } from './service';
export default ValidatorService;

export const validatorCapsule = {
  id: 'validator',
  name: 'Validator',
  description: 'Data validation with schema support',
  icon: '✶',
  category: 'utilities',
  version: '1.0.0',
  tags: ['validation', 'schema', 'validator', 'rules'],
};
