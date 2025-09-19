import {
  DomainEvent,
  ProjectCreatedEvent,
  ProjectUpdatedEvent,
  ProjectDeletedEvent,
  ProjectProgressUpdatedEvent,
  TodoCreatedEvent,
  TodoCompletedEvent,
  TodoDeletedEvent
} from '../../../domain/events/DomainEvent.js';

describe('DomainEvent', () => {
  beforeEach(() => {
    // Mock Date.now for consistent ID generation in tests
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create domain event with required fields', () => {
      const event = new DomainEvent('TEST_EVENT', 'aggregate123');

      expect(event.eventType).toBe('TEST_EVENT');
      expect(event.aggregateId).toBe('aggregate123');
      expect(event.data).toEqual({});
      expect(event.version).toBe(1);
      expect(event.eventId).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });

    it('should create domain event with data', () => {
      const testData = { key: 'value', number: 42 };
      const event = new DomainEvent('TEST_EVENT', 'aggregate123', testData);

      expect(event.data).toBe(testData);
    });

    it('should generate unique event ID', () => {
      const event = new DomainEvent('TEST_EVENT', 'aggregate123');

      expect(typeof event.eventId).toBe('string');
      expect(event.eventId.length).toBeGreaterThan(0);
    });

    it('should set timestamp as ISO string', () => {
      const event = new DomainEvent('TEST_EVENT', 'aggregate123');

      expect(typeof event.timestamp).toBe('string');
      expect(() => new Date(event.timestamp)).not.toThrow();
    });
  });

  describe('generateId', () => {
    it('should generate different IDs for different instances', () => {
      // Don't mock random for this test to ensure different IDs
      jest.restoreAllMocks();
      const event1 = new DomainEvent('TEST_EVENT', 'aggregate1');
      const event2 = new DomainEvent('TEST_EVENT', 'aggregate2');

      expect(event1.eventId).not.toBe(event2.eventId);
    });

    it('should generate ID with expected format', () => {
      const event = new DomainEvent('TEST_EVENT', 'aggregate123');

      expect(typeof event.eventId).toBe('string');
      expect(event.eventId.length).toBeGreaterThan(0);
    });
  });
});

describe('ProjectCreatedEvent', () => {
  it('should create project created event', () => {
    const projectData = {
      title: 'Test Project',
      description: 'Test Description',
      ownerId: 'user123'
    };
    const event = new ProjectCreatedEvent('project123', projectData);

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('PROJECT_CREATED');
    expect(event.aggregateId).toBe('project123');
    expect(event.data).toBe(projectData);
  });

  it('should inherit all domain event properties', () => {
    const event = new ProjectCreatedEvent('project123', {});

    expect(event.eventId).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.version).toBe(1);
  });
});

describe('ProjectUpdatedEvent', () => {
  it('should create project updated event', () => {
    const changes = { title: 'Updated Title', progress: 50 };
    const event = new ProjectUpdatedEvent('project123', changes);

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('PROJECT_UPDATED');
    expect(event.aggregateId).toBe('project123');
    expect(event.data).toEqual({ changes });
  });

  it('should wrap changes in data object', () => {
    const changes = { priority: 'high' };
    const event = new ProjectUpdatedEvent('project123', changes);

    expect(event.data.changes).toBe(changes);
  });
});

describe('ProjectDeletedEvent', () => {
  it('should create project deleted event', () => {
    const event = new ProjectDeletedEvent('project123');

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('PROJECT_DELETED');
    expect(event.aggregateId).toBe('project123');
    expect(event.data).toEqual({});
  });
});

describe('ProjectProgressUpdatedEvent', () => {
  it('should create project progress updated event', () => {
    const event = new ProjectProgressUpdatedEvent('project123', 25, 50);

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('PROJECT_PROGRESS_UPDATED');
    expect(event.aggregateId).toBe('project123');
    expect(event.data).toEqual({
      oldProgress: 25,
      newProgress: 50
    });
  });

  it('should handle zero progress values', () => {
    const event = new ProjectProgressUpdatedEvent('project123', 0, 100);

    expect(event.data.oldProgress).toBe(0);
    expect(event.data.newProgress).toBe(100);
  });
});

describe('TodoCreatedEvent', () => {
  it('should create todo created event', () => {
    const todoData = {
      title: 'Test Todo',
      description: 'Test Description',
      projectId: 'project123'
    };
    const event = new TodoCreatedEvent('todo123', todoData);

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('TODO_CREATED');
    expect(event.aggregateId).toBe('todo123');
    expect(event.data).toBe(todoData);
  });
});

describe('TodoCompletedEvent', () => {
  it('should create todo completed event', () => {
    const event = new TodoCompletedEvent('todo123', 'project123');

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('TODO_COMPLETED');
    expect(event.aggregateId).toBe('todo123');
    expect(event.data).toEqual({ projectId: 'project123' });
  });
});

describe('TodoDeletedEvent', () => {
  it('should create todo deleted event', () => {
    const event = new TodoDeletedEvent('todo123', 'project123');

    expect(event).toBeInstanceOf(DomainEvent);
    expect(event.eventType).toBe('TODO_DELETED');
    expect(event.aggregateId).toBe('todo123');
    expect(event.data).toEqual({ projectId: 'project123' });
  });
});

describe('Event inheritance', () => {
  it('should have all events inherit from DomainEvent', () => {
    const events = [
      new ProjectCreatedEvent('id', {}),
      new ProjectUpdatedEvent('id', {}),
      new ProjectDeletedEvent('id'),
      new ProjectProgressUpdatedEvent('id', 0, 50),
      new TodoCreatedEvent('id', {}),
      new TodoCompletedEvent('id', 'projectId'),
      new TodoDeletedEvent('id', 'projectId')
    ];

    events.forEach(event => {
      expect(event).toBeInstanceOf(DomainEvent);
      expect(event.eventId).toBeDefined();
      expect(event.timestamp).toBeDefined();
      expect(event.version).toBe(1);
      expect(typeof event.eventType).toBe('string');
      expect(typeof event.aggregateId).toBe('string');
      expect(typeof event.data).toBe('object');
    });
  });

  it('should have unique event types', () => {
    const events = [
      new ProjectCreatedEvent('id', {}),
      new ProjectUpdatedEvent('id', {}),
      new ProjectDeletedEvent('id'),
      new ProjectProgressUpdatedEvent('id', 0, 50),
      new TodoCreatedEvent('id', {}),
      new TodoCompletedEvent('id', 'projectId'),
      new TodoDeletedEvent('id', 'projectId')
    ];

    const eventTypes = events.map(event => event.eventType);
    const uniqueEventTypes = [...new Set(eventTypes)];

    expect(eventTypes).toHaveLength(uniqueEventTypes.length);
  });
});