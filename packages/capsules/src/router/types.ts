export type RouteParams = Record<string, string>;
export type QueryParams = Record<string, string | string[]>;

export interface RouterConfig {
  mode?: 'hash' | 'history' | 'memory';
  basePath?: string;
  initialPath?: string;
  routes?: Route[];
  notFoundHandler?: RouteHandler;
  debug?: boolean;
}

export interface Route {
  path: string;
  handler: RouteHandler;
  name?: string;
  meta?: Record<string, any>;
  beforeEnter?: RouteGuard;
}

export type RouteHandler = (context: RouteContext) => void | Promise<void>;
export type RouteGuard = (to: RouteContext, from?: RouteContext) => boolean | Promise<boolean>;

export interface RouteContext {
  path: string;
  params: RouteParams;
  query: QueryParams;
  hash: string;
  meta?: Record<string, any>;
}

export interface RouterStats {
  totalNavigations: number;
  successfulNavigations: number;
  failedNavigations: number;
  backNavigations: number;
  forwardNavigations: number;
  errors: number;
}