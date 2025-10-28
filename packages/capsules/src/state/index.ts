export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { StateAdapter, createAdapter } from './adapters';
export { StateService, createStateService } from './service';
import { StateService } from './service';
export default StateService;
export const stateCapsule = {
  id: 'state',
  name: 'State',
  description: 'State management',
  icon: '⊡',
  category: 'state',
  version: '1.0.0',
  tags: ['state'],
};