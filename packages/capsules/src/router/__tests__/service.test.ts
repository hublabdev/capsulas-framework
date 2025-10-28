import { describe, it, expect, beforeEach } from 'vitest';
import { RouterService, createRouterService } from '../service';
import { RouterError } from '../errors';

describe('RouterService', () => {
  let service: RouterService;

  beforeEach(async () => {
    service = await createRouterService({
      mode: 'memory',
      initialPath: '/',
    });
    await service.initialize();
  });

  describe('Route Registration', () => {
    it('should add route', () => {
      service.addRoute({
        path: '/test',
        handler: () => 'test',
      });
      expect(service.getRoutes()).toHaveLength(1);
    });

    it('should add route with params', () => {
      service.addRoute({
        path: '/users/:id',
        handler: (ctx) => ctx.params.id,
      });
      expect(service.getRoutes()).toHaveLength(1);
    });

    it('should reject duplicate routes', () => {
      service.addRoute({ path: '/test', handler: () => {} });
      expect(() =>
        service.addRoute({ path: '/test', handler: () => {} })
      ).toThrow(RouterError);
    });
  });

  describe('Navigation', () => {
    it('should navigate to path', async () => {
      service.addRoute({ path: '/test', handler: () => 'test' });
      await service.push('/test');
      expect(service.getCurrentPath()).toBe('/test');
    });

    it('should extract params', async () => {
      let capturedParams: any;
      service.addRoute({
        path: '/users/:id',
        handler: (ctx) => { capturedParams = ctx.params; },
      });
      await service.push('/users/123');
      expect(capturedParams.id).toBe('123');
    });

    it('should handle query params', async () => {
      let capturedQuery: any;
      service.addRoute({
        path: '/search',
        handler: (ctx) => { capturedQuery = ctx.query; },
      });
      await service.push('/search?q=test');
      expect(capturedQuery.q).toBe('test');
    });
  });

  describe('Route Guards', () => {
    it('should execute beforeEnter guard', async () => {
      let guardCalled = false;
      service.addRoute({
        path: '/protected',
        handler: () => 'protected',
        beforeEnter: async () => {
          guardCalled = true;
          return true;
        },
      });
      await service.push('/protected');
      expect(guardCalled).toBe(true);
    });

    it('should block navigation when guard returns false', async () => {
      service.addRoute({
        path: '/protected',
        handler: () => 'protected',
        beforeEnter: async () => false,
      });
      await service.push('/protected');
      expect(service.getCurrentPath()).not.toBe('/protected');
    });
  });

  describe('Navigation History', () => {
    it('should track history', async () => {
      service.addRoute({ path: '/a', handler: () => {} });
      service.addRoute({ path: '/b', handler: () => {} });
      await service.push('/a');
      await service.push('/b');
      const history = service.getHistory();
      expect(history.length).toBeGreaterThan(1);
    });

    it('should go back', async () => {
      service.addRoute({ path: '/a', handler: () => {} });
      service.addRoute({ path: '/b', handler: () => {} });
      await service.push('/a');
      await service.push('/b');
      await service.back();
      expect(service.getCurrentPath()).toBe('/a');
    });
  });

  describe('Statistics', () => {
    it('should track navigation', async () => {
      service.addRoute({ path: '/test', handler: () => {} });
      await service.push('/test');
      const stats = service.getStats();
      expect(stats.totalNavigations).toBeGreaterThan(0);
    });
  });
});
