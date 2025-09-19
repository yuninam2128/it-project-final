import { TodoValidator } from '../../../domain/validators/TodoValidator.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('TodoValidator', () => {
  describe('validateTitle', () => {
    it('should validate valid title', () => {
      expect(() => TodoValidator.validateTitle('Valid Title')).not.toThrow();
    });

    it('should throw error when title is missing', () => {
      expect(() => TodoValidator.validateTitle(null)).toThrow(ValidationError);
      expect(() => TodoValidator.validateTitle(undefined)).toThrow(ValidationError);
      expect(() => TodoValidator.validateTitle('')).toThrow(ValidationError);
    });

    it('should throw error when title is not a string', () => {
      expect(() => TodoValidator.validateTitle(123)).toThrow(ValidationError);
      expect(() => TodoValidator.validateTitle({})).toThrow(ValidationError);
      expect(() => TodoValidator.validateTitle([])).toThrow(ValidationError);
    });

    it('should throw error when title is empty after trim', () => {
      expect(() => TodoValidator.validateTitle('   ')).toThrow(ValidationError);
      expect(() => TodoValidator.validateTitle('\t\n')).toThrow(ValidationError);
    });

    it('should throw error when title is too long', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => TodoValidator.validateTitle(longTitle)).toThrow(ValidationError);
    });

    it('should accept title at max length', () => {
      const maxTitle = 'a'.repeat(200);
      expect(() => TodoValidator.validateTitle(maxTitle)).not.toThrow();
    });

    it('should accept title with spaces', () => {
      expect(() => TodoValidator.validateTitle('Title with spaces')).not.toThrow();
    });
  });

  describe('validateDescription', () => {
    it('should validate valid description', () => {
      expect(() => TodoValidator.validateDescription('Valid description')).not.toThrow();
    });

    it('should allow null or undefined description', () => {
      expect(() => TodoValidator.validateDescription(null)).not.toThrow();
      expect(() => TodoValidator.validateDescription(undefined)).not.toThrow();
    });

    it('should allow empty string description', () => {
      expect(() => TodoValidator.validateDescription('')).not.toThrow();
    });

    it('should throw error when description is not a string', () => {
      expect(() => TodoValidator.validateDescription(123)).toThrow(ValidationError);
      expect(() => TodoValidator.validateDescription({})).toThrow(ValidationError);
      expect(() => TodoValidator.validateDescription([])).toThrow(ValidationError);
    });

    it('should throw error when description is too long', () => {
      const longDescription = 'a'.repeat(501);
      expect(() => TodoValidator.validateDescription(longDescription)).toThrow(ValidationError);
    });

    it('should accept description at max length', () => {
      const maxDescription = 'a'.repeat(500);
      expect(() => TodoValidator.validateDescription(maxDescription)).not.toThrow();
    });

    it('should accept description with special characters', () => {
      const specialDescription = 'Description with\nnewlines\tand\ttabs & symbols!';
      expect(() => TodoValidator.validateDescription(specialDescription)).not.toThrow();
    });
  });

  describe('validateProjectId', () => {
    it('should validate valid project ID', () => {
      expect(() => TodoValidator.validateProjectId('project123')).not.toThrow();
      expect(() => TodoValidator.validateProjectId('proj-456-abc')).not.toThrow();
    });

    it('should throw error when project ID is missing', () => {
      expect(() => TodoValidator.validateProjectId(null)).toThrow(ValidationError);
      expect(() => TodoValidator.validateProjectId(undefined)).toThrow(ValidationError);
      expect(() => TodoValidator.validateProjectId('')).toThrow(ValidationError);
    });

    it('should throw error when project ID is not a string', () => {
      expect(() => TodoValidator.validateProjectId(123)).toThrow(ValidationError);
      expect(() => TodoValidator.validateProjectId({})).toThrow(ValidationError);
      expect(() => TodoValidator.validateProjectId([])).toThrow(ValidationError);
    });

    it('should accept project ID with special characters', () => {
      expect(() => TodoValidator.validateProjectId('project_123-abc')).not.toThrow();
    });
  });

  describe('validateCompleted', () => {
    it('should validate valid completed values', () => {
      expect(() => TodoValidator.validateCompleted(true)).not.toThrow();
      expect(() => TodoValidator.validateCompleted(false)).not.toThrow();
    });

    it('should allow undefined completed', () => {
      expect(() => TodoValidator.validateCompleted(undefined)).not.toThrow();
    });

    it('should throw error for non-boolean values', () => {
      expect(() => TodoValidator.validateCompleted(null)).toThrow(ValidationError);
      expect(() => TodoValidator.validateCompleted('true')).toThrow(ValidationError);
      expect(() => TodoValidator.validateCompleted(1)).toThrow(ValidationError);
      expect(() => TodoValidator.validateCompleted(0)).toThrow(ValidationError);
      expect(() => TodoValidator.validateCompleted({})).toThrow(ValidationError);
      expect(() => TodoValidator.validateCompleted([])).toThrow(ValidationError);
    });
  });

  describe('validateCreate', () => {
    const validCreateData = {
      title: 'Test Todo',
      description: 'Test description',
      projectId: 'project123'
    };

    it('should validate valid create data', () => {
      expect(() => TodoValidator.validateCreate(validCreateData)).not.toThrow();
    });

    it('should validate create data without description', () => {
      const dataWithoutDescription = {
        title: 'Test Todo',
        projectId: 'project123'
      };
      expect(() => TodoValidator.validateCreate(dataWithoutDescription)).not.toThrow();
    });

    it('should throw error for missing title', () => {
      const dataWithoutTitle = { ...validCreateData };
      delete dataWithoutTitle.title;
      expect(() => TodoValidator.validateCreate(dataWithoutTitle)).toThrow(ValidationError);
    });

    it('should throw error for missing project ID', () => {
      const dataWithoutProjectId = { ...validCreateData };
      delete dataWithoutProjectId.projectId;
      expect(() => TodoValidator.validateCreate(dataWithoutProjectId)).toThrow(ValidationError);
    });

    it('should throw error for invalid title', () => {
      const dataWithInvalidTitle = {
        ...validCreateData,
        title: 'a'.repeat(201)
      };
      expect(() => TodoValidator.validateCreate(dataWithInvalidTitle)).toThrow(ValidationError);
    });

    it('should throw error for invalid description', () => {
      const dataWithInvalidDescription = {
        ...validCreateData,
        description: 'a'.repeat(501)
      };
      expect(() => TodoValidator.validateCreate(dataWithInvalidDescription)).toThrow(ValidationError);
    });

    it('should throw error for invalid project ID', () => {
      const dataWithInvalidProjectId = {
        ...validCreateData,
        projectId: 123
      };
      expect(() => TodoValidator.validateCreate(dataWithInvalidProjectId)).toThrow(ValidationError);
    });
  });

  describe('validateUpdate', () => {
    it('should validate valid update data', () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        completed: true
      };
      expect(() => TodoValidator.validateUpdate(updateData)).not.toThrow();
    });

    it('should allow partial updates', () => {
      expect(() => TodoValidator.validateUpdate({ title: 'New Title' })).not.toThrow();
      expect(() => TodoValidator.validateUpdate({ description: 'New description' })).not.toThrow();
      expect(() => TodoValidator.validateUpdate({ completed: false })).not.toThrow();
    });

    it('should validate each field when provided', () => {
      expect(() => TodoValidator.validateUpdate({ title: '' })).toThrow(ValidationError);
      expect(() => TodoValidator.validateUpdate({ title: 'a'.repeat(201) })).toThrow(ValidationError);
      expect(() => TodoValidator.validateUpdate({ description: 'a'.repeat(501) })).toThrow(ValidationError);
      expect(() => TodoValidator.validateUpdate({ completed: 'true' })).toThrow(ValidationError);
    });

    it('should allow empty update object', () => {
      expect(() => TodoValidator.validateUpdate({})).not.toThrow();
    });

    it('should skip validation for undefined fields', () => {
      const updateData = {
        title: undefined,
        description: undefined,
        completed: undefined
      };
      expect(() => TodoValidator.validateUpdate(updateData)).not.toThrow();
    });

    it('should validate multiple fields together', () => {
      const validUpdate = {
        title: 'Valid Title',
        description: 'Valid description',
        completed: true
      };
      expect(() => TodoValidator.validateUpdate(validUpdate)).not.toThrow();

      const invalidUpdate = {
        title: 'Valid Title',
        description: 'a'.repeat(501), // Too long
        completed: true
      };
      expect(() => TodoValidator.validateUpdate(invalidUpdate)).toThrow(ValidationError);
    });

    it('should allow setting description to empty string', () => {
      expect(() => TodoValidator.validateUpdate({ description: '' })).not.toThrow();
    });

    it('should allow setting completed to false', () => {
      expect(() => TodoValidator.validateUpdate({ completed: false })).not.toThrow();
    });
  });
});