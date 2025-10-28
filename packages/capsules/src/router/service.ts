import type { RouterConfig, RouterStats, Route, RouteContext } from './types';
import { createAdapter, RouterAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { RouterError, RouterErrorType } from './errors';
import { matchPath, parseQuery } from './utils';

export class RouterService {
  private adapter: RouterAdapter | null = null;
  private config: RouterConfig;
  private stats: RouterStats = { ...INITIAL_STATS };
  private initialized = false;
  private routes: Map<string, Route> = new Map();
  private currentContext: RouteContext | null = null;
  private unlisten: (() => void) | null = null;

  constructor(config: RouterConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (config.routes) {
      config.routes.forEach((route) => {
        this.addRoute(route);
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);

      // Start listening to route changes
      this.unlisten = this.adapter.listen((path) => {
        this.handleRouteChange(path);
      });

      // Handle initial route
      const currentPath = this.adapter.getCurrentPath();
      await this.handleRouteChange(currentPath);

      this.initialized = true;

      if (this.config.debug) {
        console.log('[Router] Initialized with mode:', this.config.mode);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  addRoute(route: Route): void {
    if (this.routes.has(route.path)) {
      throw new RouterError(
        RouterErrorType.DUPLICATE_ROUTE,
        `Route already exists: ${route.path}`
      );
    }

    this.routes.set(route.path, route);

    if (this.config.debug) {
      console.log('[Router] Added route:', route.path);
    }
  }

  async push(path: string): Promise<void> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      this.stats.totalNavigations++;
      this.adapter!.push(path);
      this.stats.successfulNavigations++;

      if (this.config.debug) {
        console.log('[Router] Navigated to:', path);
      }
    } catch (error) {
      this.stats.errors++;
      this.stats.failedNavigations++;
      throw new RouterError(
        RouterErrorType.NAVIGATION_FAILED,
        `Failed to navigate to: ${path}`
      );
    }
  }

  async replace(path: string): Promise<void> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      this.adapter!.replace(path);

      if (this.config.debug) {
        console.log('[Router] Replaced with:', path);
      }
    } catch (error) {
      this.stats.errors++;
      throw new RouterError(
        RouterErrorType.NAVIGATION_FAILED,
        `Failed to replace with: ${path}`
      );
    }
  }

  back(): void {
    if (!this.initialized || !this.adapter) {
      throw new RouterError(RouterErrorType.INVALID_CONFIG, 'Router not initialized');
    }

    this.adapter.back();
    this.stats.backNavigations++;

    if (this.config.debug) {
      console.log('[Router] Navigated back');
    }
  }

  forward(): void {
    if (!this.initialized || !this.adapter) {
      throw new RouterError(RouterErrorType.INVALID_CONFIG, 'Router not initialized');
    }

    this.adapter.forward();
    this.stats.forwardNavigations++;

    if (this.config.debug) {
      console.log('[Router] Navigated forward');
    }
  }

  private async handleRouteChange(path: string): Promise<void> {
    const [pathname, search, hash] = this.parsePath(path);

    // Find matching route
    let matchedRoute: Route | null = null;
    let params: Record<string, string> = {};

    for (const route of this.routes.values()) {
      const match = matchPath(route.path, pathname);
      if (match) {
        matchedRoute = route;
        params = match;
        break;
      }
    }

    const context: RouteContext = {
      path: pathname,
      params,
      query: parseQuery(search),
      hash,
      meta: matchedRoute?.meta,
    };

    // Call route guard if exists
    if (matchedRoute?.beforeEnter) {
      const canEnter = await matchedRoute.beforeEnter(context, this.currentContext || undefined);
      if (!canEnter) {
        if (this.config.debug) {
          console.log('[Router] Route guard blocked navigation to:', path);
        }
        return;
      }
    }

    this.currentContext = context;

    // Call route handler
    if (matchedRoute) {
      try {
        await matchedRoute.handler(context);
      } catch (error) {
        this.stats.errors++;
        throw new RouterError(
          RouterErrorType.HANDLER_ERROR,
          `Route handler failed: ${error}`
        );
      }
    } else if (this.config.notFoundHandler) {
      await this.config.notFoundHandler(context);
    } else if (this.config.debug) {
      console.warn('[Router] No route matched for:', path);
    }
  }

  private parsePath(path: string): [string, string, string] {
    const hashIndex = path.indexOf('#');
    const queryIndex = path.indexOf('?');

    let pathname = path;
    let search = '';
    let hash = '';

    if (queryIndex !== -1) {
      pathname = path.slice(0, queryIndex);
      search = hashIndex !== -1
        ? path.slice(queryIndex, hashIndex)
        : path.slice(queryIndex);
    }

    if (hashIndex !== -1) {
      if (queryIndex === -1) {
        pathname = path.slice(0, hashIndex);
      }
      hash = path.slice(hashIndex + 1);
    }

    return [pathname, search, hash];
  }

  getCurrentContext(): RouteContext | null {
    return this.currentContext ? { ...this.currentContext } : null;
  }

  getCurrentPath(): string {
    return this.currentContext?.path || '/';
  }

  getRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  getHistory(): string[] {
    // For MemoryAdapter, return the actual history
    if (this.adapter && 'history' in this.adapter) {
      return [...(this.adapter as any).history];
    }
    // For other adapters, return empty array
    return [];
  }

  getStats(): RouterStats {
    return { ...this.stats };
  }

  getConfig(): RouterConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[Router] Cleaning up service');
    }

    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }

    this.routes.clear();
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createRouterService(config: RouterConfig): Promise<RouterService> {
  const service = new RouterService(config);
  await service.initialize();
  return service;
}
