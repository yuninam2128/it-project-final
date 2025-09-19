import { ProjectValidator } from '../../../domain/validators/ProjectValidator.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('ProjectValidator', () => {
  describe('validateTitle', () => {
    it('should validate valid title', () => {
      expect(() => ProjectValidator.validateTitle('Valid Title')).not.toThrow();
    });

    it('should throw error when title is missing', () => {
      expect(() => ProjectValidator.validateTitle(null)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateTitle(undefined)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateTitle('')).toThrow(ValidationError);
    });

    it('should throw error when title is not a string', () => {
      expect(() => ProjectValidator.validateTitle(123)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateTitle({})).toThrow(ValidationError);
    });

    it('should throw error when title is empty after trim', () => {
      expect(() => ProjectValidator.validateTitle('   ')).toThrow(ValidationError);
    });

    it('should throw error when title is too long', () => {
      const longTitle = 'a'.repeat(101);
      expect(() => ProjectValidator.validateTitle(longTitle)).toThrow(ValidationError);
    });

    it('should accept title at max length', () => {
      const maxTitle = 'a'.repeat(100);
      expect(() => ProjectValidator.validateTitle(maxTitle)).not.toThrow();
    });
  });

  describe('validateDescription', () => {
    it('should validate valid description', () => {
      expect(() => ProjectValidator.validateDescription('Valid description')).not.toThrow();
    });

    it('should allow null or undefined description', () => {
      expect(() => ProjectValidator.validateDescription(null)).not.toThrow();
      expect(() => ProjectValidator.validateDescription(undefined)).not.toThrow();
    });

    it('should throw error when description is not a string', () => {
      expect(() => ProjectValidator.validateDescription(123)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateDescription({})).toThrow(ValidationError);
    });

    it('should throw error when description is too long', () => {
      const longDescription = 'a'.repeat(1001);
      expect(() => ProjectValidator.validateDescription(longDescription)).toThrow(ValidationError);
    });

    it('should accept description at max length', () => {
      const maxDescription = 'a'.repeat(1000);
      expect(() => ProjectValidator.validateDescription(maxDescription)).not.toThrow();
    });
  });

  describe('validatePriority', () => {
    it('should validate valid priorities', () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      validPriorities.forEach(priority => {
        expect(() => ProjectValidator.validatePriority(priority)).not.toThrow();
      });
    });

    it('should allow null or undefined priority', () => {
      expect(() => ProjectValidator.validatePriority(null)).not.toThrow();
      expect(() => ProjectValidator.validatePriority(undefined)).not.toThrow();
    });

    it('should throw error for invalid priority', () => {
      expect(() => ProjectValidator.validatePriority('invalid')).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePriority('LOW')).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePriority(123)).toThrow(ValidationError);
    });
  });

  describe('validateDeadline', () => {
    it('should validate valid future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(() => ProjectValidator.validateDeadline(futureDate.toISOString())).not.toThrow();
    });

    it('should allow null or undefined deadline', () => {
      expect(() => ProjectValidator.validateDeadline(null)).not.toThrow();
      expect(() => ProjectValidator.validateDeadline(undefined)).not.toThrow();
    });

    it('should throw error for invalid date format', () => {
      expect(() => ProjectValidator.validateDeadline('invalid-date')).toThrow(ValidationError);
      expect(() => ProjectValidator.validateDeadline('2024-13-01')).toThrow(ValidationError);
    });

    it('should throw error for past date', () => {
      expect(() => ProjectValidator.validateDeadline('2020-01-01')).toThrow(ValidationError);
    });

    it('should accept future date as deadline', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const tomorrow = futureDate.toISOString().split('T')[0];
      expect(() => ProjectValidator.validateDeadline(tomorrow)).not.toThrow();
    });
  });

  describe('validateProgress', () => {
    it('should validate valid progress values', () => {
      [0, 25, 50, 75, 100].forEach(progress => {
        expect(() => ProjectValidator.validateProgress(progress)).not.toThrow();
      });
    });

    it('should allow undefined progress', () => {
      expect(() => ProjectValidator.validateProgress(undefined)).not.toThrow();
    });

    it('should throw error for invalid progress values', () => {
      expect(() => ProjectValidator.validateProgress(-1)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateProgress(101)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateProgress('50')).toThrow(ValidationError);
      expect(() => ProjectValidator.validateProgress(null)).toThrow(ValidationError);
    });

    it('should accept decimal progress values', () => {
      expect(() => ProjectValidator.validateProgress(50.5)).not.toThrow();
    });
  });

  describe('validateOwnerId', () => {
    it('should validate valid owner ID', () => {
      expect(() => ProjectValidator.validateOwnerId('user123')).not.toThrow();
    });

    it('should throw error when owner ID is missing', () => {
      expect(() => ProjectValidator.validateOwnerId(null)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateOwnerId(undefined)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateOwnerId('')).toThrow(ValidationError);
    });

    it('should throw error when owner ID is not a string', () => {
      expect(() => ProjectValidator.validateOwnerId(123)).toThrow(ValidationError);
      expect(() => ProjectValidator.validateOwnerId({})).toThrow(ValidationError);
    });
  });

  describe('validatePosition', () => {
    it('should validate valid position', () => {
      const validPosition = { x: 100, y: 200, radius: 50 };
      expect(() => ProjectValidator.validatePosition(validPosition)).not.toThrow();
    });

    it('should validate position without radius', () => {
      const positionWithoutRadius = { x: 100, y: 200 };
      expect(() => ProjectValidator.validatePosition(positionWithoutRadius)).not.toThrow();
    });

    it('should allow null or undefined position', () => {
      expect(() => ProjectValidator.validatePosition(null)).not.toThrow();
      expect(() => ProjectValidator.validatePosition(undefined)).not.toThrow();
    });

    it('should throw error for invalid position object', () => {
      expect(() => ProjectValidator.validatePosition('invalid')).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePosition(123)).toThrow(ValidationError);
    });

    it('should throw error for missing x or y coordinates', () => {
      expect(() => ProjectValidator.validatePosition({ x: 100 })).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePosition({ y: 200 })).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePosition({})).toThrow(ValidationError);
    });

    it('should throw error for non-numeric coordinates', () => {
      expect(() => ProjectValidator.validatePosition({ x: '100', y: 200 })).toThrow(ValidationError);
      expect(() => ProjectValidator.validatePosition({ x: 100, y: '200' })).toThrow(ValidationError);
    });

    it('should throw error for non-numeric radius', () => {
      expect(() => ProjectValidator.validatePosition({ x: 100, y: 200, radius: '50' })).toThrow(ValidationError);
    });

    it('should accept negative coordinates', () => {
      const position = { x: -100, y: -200 };
      expect(() => ProjectValidator.validatePosition(position)).not.toThrow();
    });
  });

  describe('validateCreate', () => {
    const validCreateData = {
      title: 'Test Project',
      description: 'Test description',
      priority: 'high',
      deadline: '2025-12-31',
      ownerId: 'user123'
    };

    it('should validate valid create data', () => {
      expect(() => ProjectValidator.validateCreate(validCreateData)).not.toThrow();
    });

    it('should validate create data without optional fields', () => {
      const minimalData = {
        title: 'Test Project',
        ownerId: 'user123'
      };
      expect(() => ProjectValidator.validateCreate(minimalData)).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const dataWithoutTitle = { ...validCreateData };
      delete dataWithoutTitle.title;
      expect(() => ProjectValidator.validateCreate(dataWithoutTitle)).toThrow(ValidationError);

      const dataWithoutOwnerId = { ...validCreateData };
      delete dataWithoutOwnerId.ownerId;
      expect(() => ProjectValidator.validateCreate(dataWithoutOwnerId)).toThrow(ValidationError);
    });

    it('should validate all fields when provided', () => {
      const dataWithPosition = {
        ...validCreateData,
        position: { x: 100, y: 200, radius: 50 }
      };
      expect(() => ProjectValidator.validateCreate(dataWithPosition)).not.toThrow();
    });
  });

  describe('validateUpdate', () => {
    it('should validate valid update data', () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'medium',
        progress: 50
      };
      expect(() => ProjectValidator.validateUpdate(updateData)).not.toThrow();
    });

    it('should allow partial updates', () => {
      expect(() => ProjectValidator.validateUpdate({ title: 'New Title' })).not.toThrow();
      expect(() => ProjectValidator.validateUpdate({ progress: 75 })).not.toThrow();
    });

    it('should validate each field when provided', () => {
      expect(() => ProjectValidator.validateUpdate({ title: '' })).toThrow(ValidationError);
      expect(() => ProjectValidator.validateUpdate({ priority: 'invalid' })).toThrow(ValidationError);
      expect(() => ProjectValidator.validateUpdate({ progress: 101 })).toThrow(ValidationError);
    });

    it('should allow empty update object', () => {
      expect(() => ProjectValidator.validateUpdate({})).not.toThrow();
    });

    it('should validate position updates', () => {
      const validPosition = { x: 100, y: 200 };
      expect(() => ProjectValidator.validateUpdate({ position: validPosition })).not.toThrow();

      const invalidPosition = { x: 'invalid' };
      expect(() => ProjectValidator.validateUpdate({ position: invalidPosition })).toThrow(ValidationError);
    });
  });
});