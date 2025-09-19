import { ProjectValidator } from '../validators/ProjectValidator.js';
import { BusinessRuleError } from '../errors/DomainError.js';

export class Project {
  constructor({
    id,
    title,
    description,
    priority,
    deadline,
    progress = 0,
    ownerId,
    position = null,
    subtasks = [],
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.deadline = deadline;
    this.progress = progress;
    this.ownerId = ownerId;
    this.position = position;
    this.subtasks = subtasks;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create({
    title,
    description,
    priority,
    deadline,
    ownerId,
    position = null,
    subtasks = []
  }) {
    const data = { title, description, priority, deadline, ownerId, position };
    ProjectValidator.validateCreate(data);

    return new Project({
      title,
      description,
      priority,
      deadline,
      ownerId,
      position,
      subtasks,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateProgress() {
    if (this.subtasks.length === 0) {
      this.progress = 0;
      return;
    }

    const completedTasks = this.subtasks.filter(task => task.completed).length;
    this.progress = Math.round((completedTasks / this.subtasks.length) * 100);
    this.updatedAt = new Date();
  }

  updatePosition(position) {
    this.position = position;
    this.updatedAt = new Date();
  }

  update(updates) {
    ProjectValidator.validateUpdate(updates);
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
  }

  isOverdue() {
    return this.deadline && new Date() > new Date(this.deadline);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      deadline: this.deadline,
      progress: this.progress,
      ownerId: this.ownerId,
      position: this.position,
      subtasks: this.subtasks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}