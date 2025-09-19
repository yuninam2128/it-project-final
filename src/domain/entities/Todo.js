import { TodoValidator } from '../validators/TodoValidator.js';

export class Todo {
  constructor({
    id,
    title,
    description,
    completed = false,
    projectId,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = completed;
    this.projectId = projectId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create({
    title,
    description,
    projectId
  }) {
    const data = { title, description, projectId };
    TodoValidator.validateCreate(data);

    return new Todo({
      title,
      description,
      projectId,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  complete() {
    this.completed = true;
    this.updatedAt = new Date();
  }

  incomplete() {
    this.completed = false;
    this.updatedAt = new Date();
  }

  update(updates) {
    TodoValidator.validateUpdate(updates);
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'projectId') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      completed: this.completed,
      projectId: this.projectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}