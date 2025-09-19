import { ValidationError } from '../errors/DomainError.js';

export class TodoValidator {
  static validateTitle(title) {
    if (!title || typeof title !== 'string') {
      throw new ValidationError('Title is required and must be a string', 'title', title);
    }
    
    if (title.trim().length === 0) {
      throw new ValidationError('Title cannot be empty', 'title', title);
    }
    
    if (title.length > 200) {
      throw new ValidationError('Title cannot exceed 200 characters', 'title', title);
    }
  }

  static validateDescription(description) {
    if (description && typeof description !== 'string') {
      throw new ValidationError('Description must be a string', 'description', description);
    }
    
    if (description && description.length > 500) {
      throw new ValidationError('Description cannot exceed 500 characters', 'description', description);
    }
  }

  static validateProjectId(projectId) {
    if (!projectId || typeof projectId !== 'string') {
      throw new ValidationError('Project ID is required and must be a string', 'projectId', projectId);
    }
  }

  static validateCompleted(completed) {
    if (completed !== undefined && typeof completed !== 'boolean') {
      throw new ValidationError('Completed must be a boolean', 'completed', completed);
    }
  }

  static validateCreate(data) {
    this.validateTitle(data.title);
    this.validateDescription(data.description);
    this.validateProjectId(data.projectId);
  }

  static validateUpdate(data) {
    if (data.title !== undefined) this.validateTitle(data.title);
    if (data.description !== undefined) this.validateDescription(data.description);
    if (data.completed !== undefined) this.validateCompleted(data.completed);
  }
}