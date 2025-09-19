import { Todo } from '../../../domain';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('Todo Entity', () => {
  const validTodoData = {
    title: 'Test Todo',
    description: 'Test Description',
    projectId: 'project123'
  };

  describe('Todo.create', () => {
    it('should create a todo with valid data', () => {
      const todo = Todo.create(validTodoData);

      expect(todo.title).toBe(validTodoData.title);
      expect(todo.description).toBe(validTodoData.description);
      expect(todo.projectId).toBe(validTodoData.projectId);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError when title is missing', () => {
      const invalidData = { ...validTodoData };
      delete invalidData.title;

      expect(() => Todo.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when projectId is missing', () => {
      const invalidData = { ...validTodoData };
      delete invalidData.projectId;

      expect(() => Todo.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when title is empty', () => {
      const invalidData = {
        ...validTodoData,
        title: ''
      };

      expect(() => Todo.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when title is too long', () => {
      const invalidData = {
        ...validTodoData,
        title: 'a'.repeat(201) // Over 200 characters
      };

      expect(() => Todo.create(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when description is too long', () => {
      const invalidData = {
        ...validTodoData,
        description: 'a'.repeat(501) // Over 500 characters
      };

      expect(() => Todo.create(invalidData)).toThrow(ValidationError);
    });

    it('should create todo without description', () => {
      const todoData = {
        title: 'Test Todo',
        projectId: 'project123'
      };

      const todo = Todo.create(todoData);

      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBeUndefined();
      expect(todo.projectId).toBe(todoData.projectId);
    });
  });

  describe('constructor', () => {
    it('should create todo with all parameters', () => {
      const todoData = {
        id: 'todo123',
        title: 'Test Todo',
        description: 'Test Description',
        completed: true,
        projectId: 'project123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      };

      const todo = new Todo(todoData);

      expect(todo.id).toBe(todoData.id);
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.completed).toBe(todoData.completed);
      expect(todo.projectId).toBe(todoData.projectId);
      expect(todo.createdAt).toBe(todoData.createdAt);
      expect(todo.updatedAt).toBe(todoData.updatedAt);
    });

    it('should default completed to false', () => {
      const todoData = {
        id: 'todo123',
        title: 'Test Todo',
        projectId: 'project123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const todo = new Todo(todoData);

      expect(todo.completed).toBe(false);
    });
  });

  describe('complete', () => {
    let todo;

    beforeEach(() => {
      todo = Todo.create(validTodoData);
    });

    it('should mark todo as completed', () => {
      expect(todo.completed).toBe(false);

      todo.complete();

      expect(todo.completed).toBe(true);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = todo.updatedAt;

      // Add small delay to ensure timestamp difference
      setTimeout(() => {
        todo.complete();
        expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('incomplete', () => {
    let todo;

    beforeEach(() => {
      todo = Todo.create(validTodoData);
      todo.complete(); // Start with completed todo
    });

    it('should mark todo as incomplete', () => {
      expect(todo.completed).toBe(true);

      todo.incomplete();

      expect(todo.completed).toBe(false);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = todo.updatedAt;

      setTimeout(() => {
        todo.incomplete();
        expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('update', () => {
    let todo;

    beforeEach(() => {
      todo = Todo.create(validTodoData);
    });

    it('should update valid fields', () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      };

      todo.update(updates);

      expect(todo.title).toBe(updates.title);
      expect(todo.description).toBe(updates.description);
      expect(todo.completed).toBe(updates.completed);
    });

    it('should not update id, createdAt, or projectId', () => {
      const originalId = todo.id;
      const originalCreatedAt = todo.createdAt;
      const originalProjectId = todo.projectId;

      todo.update({
        id: 'new-id',
        createdAt: new Date(),
        projectId: 'new-project',
        title: 'Updated Title'
      });

      expect(todo.id).toBe(originalId);
      expect(todo.createdAt).toBe(originalCreatedAt);
      expect(todo.projectId).toBe(originalProjectId);
      expect(todo.title).toBe('Updated Title');
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = todo.updatedAt;

      setTimeout(() => {
        todo.update({ title: 'New Title' });
        expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should throw ValidationError for invalid updates', () => {
      expect(() => todo.update({ title: '' })).toThrow(ValidationError);
      expect(() => todo.update({ title: 'a'.repeat(201) })).toThrow(ValidationError);
      expect(() => todo.update({ description: 'a'.repeat(501) })).toThrow(ValidationError);
      expect(() => todo.update({ completed: 'invalid' })).toThrow(ValidationError);
    });

    it('should allow partial updates', () => {
      const originalDescription = todo.description;

      todo.update({ title: 'New Title' });

      expect(todo.title).toBe('New Title');
      expect(todo.description).toBe(originalDescription);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const todo = Todo.create(validTodoData);
      const json = todo.toJSON();

      expect(json).toEqual({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        projectId: todo.projectId,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      });
    });

    it('should include all fields even when undefined', () => {
      const todoData = {
        title: 'Test Todo',
        projectId: 'project123'
      };
      const todo = Todo.create(todoData);
      const json = todo.toJSON();

      expect(json).toHaveProperty('description');
      expect(json.description).toBeUndefined();
    });
  });
});