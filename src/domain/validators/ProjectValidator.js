import { ValidationError } from '../errors/DomainError.js';

export class ProjectValidator {
  static validateTitle(title) {
    if (!title || typeof title !== 'string') {
      throw new ValidationError('Title is required and must be a string', 'title', title);
    }
    
    if (title.trim().length === 0) {
      throw new ValidationError('Title cannot be empty', 'title', title);
    }
    
    if (title.length > 100) {
      throw new ValidationError('Title cannot exceed 100 characters', 'title', title);
    }
  }

  static validateDescription(description) {
    if (description && typeof description !== 'string') {
      throw new ValidationError('Description must be a string', 'description', description);
    }
    
    if (description && description.length > 1000) {
      throw new ValidationError('Description cannot exceed 1000 characters', 'description', description);
    }
  }

  static validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      throw new ValidationError(
        `Priority must be one of: ${validPriorities.join(', ')}`, 
        'priority', 
        priority
      );
    }
  }

  static validateDeadline(deadline) {
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new ValidationError('Deadline must be a valid date', 'deadline', deadline);
      }
      
      if (deadlineDate < new Date()) {
        throw new ValidationError('Deadline cannot be in the past', 'deadline', deadline);
      }
    }
  }

  static validateProgress(progress) {
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        throw new ValidationError('Progress must be a number between 0 and 100', 'progress', progress);
      }
    }
  }

  static validateOwnerId(ownerId) {
    if (!ownerId || typeof ownerId !== 'string') {
      throw new ValidationError('Owner ID is required and must be a string', 'ownerId', ownerId);
    }
  }

  static validatePosition(position) {
    if (position) {
      if (typeof position !== 'object' || position === null) {
        throw new ValidationError('Position must be an object', 'position', position);
      }
      
      const { x, y, radius } = position;
      
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new ValidationError('Position x and y must be numbers', 'position', position);
      }
      
      if (radius && typeof radius !== 'number') {
        throw new ValidationError('Position radius must be a number', 'position', position);
      }
    }
  }

  static validateCreate(data) {
    this.validateTitle(data.title);
    this.validateDescription(data.description);
    this.validatePriority(data.priority);
    this.validateDeadline(data.deadline);
    this.validateOwnerId(data.ownerId);
    this.validatePosition(data.position);
  }

  static validateUpdate(data) {
    if (data.title !== undefined) this.validateTitle(data.title);
    if (data.description !== undefined) this.validateDescription(data.description);
    if (data.priority !== undefined) this.validatePriority(data.priority);
    if (data.deadline !== undefined) this.validateDeadline(data.deadline);
    if (data.progress !== undefined) this.validateProgress(data.progress);
    if (data.position !== undefined) this.validatePosition(data.position);
  }
}