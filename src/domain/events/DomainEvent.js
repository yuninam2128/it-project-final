export class DomainEvent {
  constructor(eventType, aggregateId, data = {}) {
    this.eventId = this.generateId();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.version = 1;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export class ProjectCreatedEvent extends DomainEvent {
  constructor(projectId, projectData) {
    super('PROJECT_CREATED', projectId, projectData);
  }
}

export class ProjectUpdatedEvent extends DomainEvent {
  constructor(projectId, changes) {
    super('PROJECT_UPDATED', projectId, { changes });
  }
}

export class ProjectDeletedEvent extends DomainEvent {
  constructor(projectId) {
    super('PROJECT_DELETED', projectId);
  }
}

export class ProjectProgressUpdatedEvent extends DomainEvent {
  constructor(projectId, oldProgress, newProgress) {
    super('PROJECT_PROGRESS_UPDATED', projectId, { oldProgress, newProgress });
  }
}

export class TodoCreatedEvent extends DomainEvent {
  constructor(todoId, todoData) {
    super('TODO_CREATED', todoId, todoData);
  }
}

export class TodoCompletedEvent extends DomainEvent {
  constructor(todoId, projectId) {
    super('TODO_COMPLETED', todoId, { projectId });
  }
}

export class TodoDeletedEvent extends DomainEvent {
  constructor(todoId, projectId) {
    super('TODO_DELETED', todoId, { projectId });
  }
}