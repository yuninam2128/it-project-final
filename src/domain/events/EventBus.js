export class EventBus {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
  }

  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }

  async publish(event) {
    try {
      // Apply middlewares
      let processedEvent = event;
      for (const middleware of this.middlewares) {
        processedEvent = await middleware(processedEvent);
        if (!processedEvent) {
          return; // Middleware stopped the event
        }
      }

      // Get handlers for this event type
      const handlers = this.handlers.get(event.eventType) || [];
      
      // Execute all handlers
      const promises = handlers.map(handler => {
        try {
          return Promise.resolve(handler(processedEvent));
        } catch (error) {
          console.error(`Error in event handler for ${event.eventType}:`, error);
          return Promise.resolve();
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error(`Error publishing event ${event.eventType}:`, error);
    }
  }

  clear() {
    this.handlers.clear();
    this.middlewares = [];
  }
}

// Singleton instance
export const eventBus = new EventBus();