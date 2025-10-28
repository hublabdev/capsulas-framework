import { describe, it, expect, beforeEach } from 'vitest';
import { StateService, createStateService } from '../service';
import { StateError, StateErrorType } from '../errors';

describe('StateService', () => {
  let service: StateService;

  beforeEach(async () => {
    service = await createStateService({
      initialState: {
        count: 0,
        user: null,
        todos: [],
      },
    });
  });

  describe('Get/Set', () => {
    it('should get initial state', () => {
      expect(service.get('count')).toBe(0);
    });

    it('should set state', () => {
      service.set('count', 5);
      expect(service.get('count')).toBe(5);
    });

    it('should set nested state', () => {
      service.set('user', { name: 'John', age: 30 });
      expect(service.get('user')).toEqual({ name: 'John', age: 30 });
    });

    it('should handle deep paths', () => {
      service.set('user', { profile: { name: 'John' } });
      expect(service.get('user.profile.name')).toBe('John');
    });
  });

  describe('Update', () => {
    it('should update with function', () => {
      service.set('count', 5);
      service.update('count', (c) => c + 1);
      expect(service.get('count')).toBe(6);
    });

    it('should update arrays', () => {
      service.update('todos', (todos) => [...todos, { id: 1, text: 'Test' }]);
      expect(service.get('todos')).toHaveLength(1);
    });
  });

  describe('Delete', () => {
    it('should delete property', () => {
      service.set('count', 5);
      service.delete('count');
      expect(service.get('count')).toBeUndefined();
    });
  });

  describe('Listeners', () => {
    it('should notify listeners on change', () => {
      let called = false;
      service.on('count', () => {
        called = true;
      });
      service.set('count', 5);
      expect(called).toBe(true);
    });

    it('should pass old and new values', () => {
      let oldValue: any, newValue: any;
      service.on('count', (n, o) => {
        newValue = n;
        oldValue = o;
      });
      service.set('count', 5);
      expect(oldValue).toBe(0);
      expect(newValue).toBe(5);
    });

    it('should unsubscribe', () => {
      let callCount = 0;
      const unsubscribe = service.on('count', () => {
        callCount++;
      });
      service.set('count', 1);
      unsubscribe();
      service.set('count', 2);
      expect(callCount).toBe(1);
    });
  });

  describe('Selectors', () => {
    it('should select derived state', () => {
      service.set('user', { name: 'John', age: 30 });
      const name = service.select((s) => s.user?.name);
      expect(name).toBe('John');
    });
  });

  describe('Snapshots', () => {
    it('should create snapshot', () => {
      service.set('count', 5);
      const snapshot = service.getSnapshot();
      expect(snapshot.state.count).toBe(5);
    });

    it('should restore snapshot', () => {
      service.set('count', 5);
      const snapshot = service.getSnapshot();
      service.set('count', 10);
      service.restoreSnapshot(snapshot);
      expect(service.get('count')).toBe(5);
    });
  });

  describe('Statistics', () => {
    it('should track updates', () => {
      service.set('count', 5);
      const stats = service.getStats();
      expect(stats.totalUpdates).toBeGreaterThan(0);
    });

    it('should track reads', () => {
      service.get('count');
      const stats = service.getStats();
      expect(stats.totalReads).toBeGreaterThan(0);
    });
  });
});
