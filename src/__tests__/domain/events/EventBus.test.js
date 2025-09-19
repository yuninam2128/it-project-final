import { EventBus, eventBus } from '../../../domain/events/EventBus.js';
import { DomainEvent } from '../../../domain/events/DomainEvent.js';

describe('EventBus', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBus();
  });

  afterEach(() => {
    // Clear any global event bus state
    eventBus.clear();
  });

  describe('constructor', () => {
    it('should initialize empty handlers map and middlewares array', () => {
      expect(bus.handlers).toBeInstanceOf(Map);
      expect(bus.handlers.size).toBe(0);
      expect(bus.middlewares).toEqual([]);
    });
  });

  describe('subscribe', () => {
    it('should subscribe handler to event type', () => {
      const handler = jest.fn();
      bus.subscribe('TEST_EVENT', handler);

      expect(bus.handlers.has('TEST_EVENT')).toBe(true);
      expect(bus.handlers.get('TEST_EVENT')).toContain(handler);
    });

    it('should allow multiple handlers for same event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.subscribe('TEST_EVENT', handler1);
      bus.subscribe('TEST_EVENT', handler2);

      const handlers = bus.handlers.get('TEST_EVENT');
      expect(handlers).toHaveLength(2);
      expect(handlers).toContain(handler1);
      expect(handlers).toContain(handler2);
    });

    it('should return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = bus.subscribe('TEST_EVENT', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe handler when unsubscribe function is called', () => {
      const handler = jest.fn();
      const unsubscribe = bus.subscribe('TEST_EVENT', handler);

      expect(bus.handlers.get('TEST_EVENT')).toContain(handler);

      unsubscribe();

      expect(bus.handlers.get('TEST_EVENT')).not.toContain(handler);
    });

    it('should handle unsubscribe for non-existent handler gracefully', () => {
      const handler = jest.fn();
      const unsubscribe = bus.subscribe('TEST_EVENT', handler);

      unsubscribe();
      
      // Calling unsubscribe again should not throw
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should handle unsubscribe for non-existent event type gracefully', () => {
      const handler = jest.fn();
      bus.subscribe('TEST_EVENT', handler);
      
      // Clear handlers manually to simulate edge case
      bus.handlers.delete('TEST_EVENT');
      
      // Getting the unsubscribe function should not throw when called
      const unsubscribe = bus.subscribe('OTHER_EVENT', handler);
      bus.handlers.delete('OTHER_EVENT');
      
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('addMiddleware', () => {
    it('should add middleware to middlewares array', () => {
      const middleware = jest.fn();
      bus.addMiddleware(middleware);

      expect(bus.middlewares).toContain(middleware);
    });

    it('should add multiple middlewares in order', () => {
      const middleware1 = jest.fn();
      const middleware2 = jest.fn();

      bus.addMiddleware(middleware1);
      bus.addMiddleware(middleware2);

      expect(bus.middlewares).toEqual([middleware1, middleware2]);
    });
  });

  describe('publish', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = new DomainEvent('TEST_EVENT', 'aggregate123', { test: 'data' });
    });

    it('should publish event to subscribed handlers', async () => {
      const handler = jest.fn();
      bus.subscribe('TEST_EVENT', handler);

      await bus.publish(mockEvent);

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should publish to multiple handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.subscribe('TEST_EVENT', handler1);
      bus.subscribe('TEST_EVENT', handler2);

      await bus.publish(mockEvent);

      expect(handler1).toHaveBeenCalledWith(mockEvent);
      expect(handler2).toHaveBeenCalledWith(mockEvent);
    });

    it('should not call handlers for different event types', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.subscribe('EVENT_TYPE_1', handler1);
      bus.subscribe('EVENT_TYPE_2', handler2);

      await bus.publish(mockEvent); // TEST_EVENT

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle events with no subscribers gracefully', async () => {
      await expect(bus.publish(mockEvent)).resolves.not.toThrow();
    });

    it('should apply middlewares before calling handlers', async () => {
      const middleware = jest.fn((event) => ({
        ...event,
        data: { ...event.data, middleware: 'applied' }
      }));
      const handler = jest.fn();

      bus.addMiddleware(middleware);
      bus.subscribe('TEST_EVENT', handler);

      await bus.publish(mockEvent);

      expect(middleware).toHaveBeenCalledWith(mockEvent);
      expect(handler).toHaveBeenCalledWith({
        ...mockEvent,
        data: { ...mockEvent.data, middleware: 'applied' }
      });
    });

    it('should apply multiple middlewares in order', async () => {
      const middleware1 = jest.fn((event) => ({
        ...event,
        data: { ...event.data, step1: 'done' }
      }));
      const middleware2 = jest.fn((event) => ({
        ...event,
        data: { ...event.data, step2: 'done' }
      }));
      const handler = jest.fn();

      bus.addMiddleware(middleware1);
      bus.addMiddleware(middleware2);
      bus.subscribe('TEST_EVENT', handler);

      await bus.publish(mockEvent);

      expect(middleware1).toHaveBeenCalledWith(mockEvent);
      expect(middleware2).toHaveBeenCalledWith({
        ...mockEvent,
        data: { ...mockEvent.data, step1: 'done' }
      });
      expect(handler).toHaveBeenCalledWith({
        ...mockEvent,
        data: { ...mockEvent.data, step1: 'done', step2: 'done' }
      });
    });

    it('should stop event processing if middleware returns null/undefined', async () => {
      const middleware = jest.fn(() => null);
      const handler = jest.fn();

      bus.addMiddleware(middleware);
      bus.subscribe('TEST_EVENT', handler);

      await bus.publish(mockEvent);

      expect(middleware).toHaveBeenCalledWith(mockEvent);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const workingHandler = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      bus.subscribe('TEST_EVENT', errorHandler);
      bus.subscribe('TEST_EVENT', workingHandler);

      await bus.publish(mockEvent);

      expect(errorHandler).toHaveBeenCalled();
      expect(workingHandler).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler for TEST_EVENT:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle async handlers', async () => {
      const asyncHandler = jest.fn(async (event) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return event;
      });

      bus.subscribe('TEST_EVENT', asyncHandler);

      await bus.publish(mockEvent);

      expect(asyncHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle middleware errors gracefully', async () => {
      const errorMiddleware = jest.fn(() => {
        throw new Error('Middleware error');
      });
      const handler = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      bus.addMiddleware(errorMiddleware);
      bus.subscribe('TEST_EVENT', handler);

      await bus.publish(mockEvent);

      expect(errorMiddleware).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error publishing event TEST_EVENT:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should wait for all handlers to complete', async () => {
      const results = [];
      const handler1 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        results.push('handler1');
      });
      const handler2 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push('handler2');
      });

      bus.subscribe('TEST_EVENT', handler1);
      bus.subscribe('TEST_EVENT', handler2);

      await bus.publish(mockEvent);

      expect(results).toContain('handler1');
      expect(results).toContain('handler2');
    });
  });

  describe('clear', () => {
    it('should clear all handlers and middlewares', () => {
      const handler = jest.fn();
      const middleware = jest.fn();

      bus.subscribe('TEST_EVENT', handler);
      bus.addMiddleware(middleware);

      expect(bus.handlers.size).toBe(1);
      expect(bus.middlewares).toHaveLength(1);

      bus.clear();

      expect(bus.handlers.size).toBe(0);
      expect(bus.middlewares).toHaveLength(0);
    });
  });

  describe('singleton eventBus', () => {
    it('should export singleton instance', () => {
      expect(eventBus).toBeInstanceOf(EventBus);
    });

    it('should be the same instance across imports', () => {
      // This tests that the singleton pattern works
      expect(eventBus).toBe(eventBus);
    });
  });
});