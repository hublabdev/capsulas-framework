export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { FormAdapter, createAdapter } from './adapters';
export { FormBuilderService, createFormBuilderService } from './service';
import { FormBuilderService } from './service';
export default FormBuilderService;
export const formbuilderCapsule = {
  id: 'form-builder',
  name: 'FormBuilder',
  description: 'Dynamic form builder',
  icon: '▭',
  category: 'forms',
  version: '1.0.0',
  tags: ['form-builder'],
};