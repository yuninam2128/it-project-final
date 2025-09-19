import { Project } from '../../../domain';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('Project Entity', () => {
  const validProjectData = {
    title: 'Test Project',
    description: 'Test Description',
    priority: 'high',
    deadline: '2025-12-31',
    ownerId: 'user123'
  };

  describe('Project.create', () => {
    it('should create a project with valid data', () => {
      const project = Project.create(validProjectData);

      expect(project.title).toBe(validProjectData.title);
      expect(project.description).toBe(validProjectData.description);
      expect(project.priority).toBe(validProjectData.priority);
      expect(project.ownerId).toBe(validProjectData.ownerId);
      expect(project.progress).toBe(0);
      expect(project.subtasks).toEqual([]);
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError when title is missing', () => {
      const invalidData = { ...validProjectData };
      delete invalidData.title;

      expect(() => Project.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when ownerId is missing', () => {
      const invalidData = { ...validProjectData };
      delete invalidData.ownerId;

      expect(() => Project.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when title is too long', () => {
      const invalidData = {
        ...validProjectData,
        title: 'a'.repeat(101) // Over 100 characters
      };

      expect(() => Project.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when priority is invalid', () => {
      const invalidData = {
        ...validProjectData,
        priority: 'invalid'
      };

      expect(() => Project.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when deadline is in the past', () => {
      const invalidData = {
        ...validProjectData,
        deadline: '2020-01-01'
      };

      expect(() => Project.create(invalidData)).toThrow(ValidationError);
    });
  });

  describe('Project methods', () => {
    let project;

    beforeEach(() => {
      project = Project.create(validProjectData);
    });

    describe('updateProgress', () => {
      it('should set progress to 0 when no subtasks', () => {
        project.updateProgress();
        expect(project.progress).toBe(0);
      });

      it('should calculate correct progress with subtasks', () => {
        project.subtasks = [
          { completed: true },
          { completed: false },
          { completed: true },
          { completed: true }
        ];

        project.updateProgress();
        expect(project.progress).toBe(75); // 3 out of 4 completed
      });

      it('should update updatedAt timestamp', () => {
        const originalUpdatedAt = project.updatedAt;
        // Wait a bit to ensure timestamp difference
        setTimeout(() => {
          project.updateProgress();
          expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }, 10);
      });
    });

    describe('updatePosition', () => {
      it('should update position correctly', () => {
        const newPosition = { x: 100, y: 200, radius: 50 };
        project.updatePosition(newPosition);

        expect(project.position).toEqual(newPosition);
      });

      it('should update updatedAt timestamp', () => {
        const originalUpdatedAt = project.updatedAt;
        const newPosition = { x: 100, y: 200, radius: 50 };
        
        setTimeout(() => {
          project.updatePosition(newPosition);
          expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }, 10);
      });
    });

    describe('update', () => {
      it('should update valid fields', () => {
        const updates = {
          title: 'Updated Title',
          description: 'Updated Description',
          priority: 'low'
        };

        project.update(updates);

        expect(project.title).toBe(updates.title);
        expect(project.description).toBe(updates.description);
        expect(project.priority).toBe(updates.priority);
      });

      it('should not update id or createdAt', () => {
        const originalId = project.id;
        const originalCreatedAt = project.createdAt;

        project.update({
          id: 'new-id',
          createdAt: new Date(),
          title: 'Updated Title'
        });

        expect(project.id).toBe(originalId);
        expect(project.createdAt).toBe(originalCreatedAt);
      });

      it('should throw ValidationError for invalid updates', () => {
        expect(() => project.update({ title: '' })).toThrow(ValidationError);
        expect(() => project.update({ priority: 'invalid' })).toThrow(ValidationError);
      });
    });

    describe('isOverdue', () => {
      it('should return false when no deadline', () => {
        project.deadline = null;
        expect(project.isOverdue()).toBe(false);
      });

      it('should return true when deadline is in the past', () => {
        project.deadline = '2020-01-01';
        expect(project.isOverdue()).toBe(true);
      });

      it('should return false when deadline is in the future', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        project.deadline = futureDate.toISOString().split('T')[0];
        expect(project.isOverdue()).toBe(false);
      });
    });

    describe('toJSON', () => {
      it('should return correct JSON representation', () => {
        const json = project.toJSON();

        expect(json).toEqual({
          id: project.id,
          title: project.title,
          description: project.description,
          priority: project.priority,
          deadline: project.deadline,
          progress: project.progress,
          ownerId: project.ownerId,
          position: project.position,
          subtasks: project.subtasks,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        });
      });
    });
  });
});