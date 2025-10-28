export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { RouterAdapter, createAdapter } from './adapters';
export { RouterService, createRouterService } from './service';
import { RouterService } from './service';
export default RouterService;
export const routerCapsule = {
  id: 'router',
  name: 'Router',
  description: 'Client-side routing',
  icon: '◈',
  category: 'routing',
  version: '1.0.0',
  tags: ['router'],
};