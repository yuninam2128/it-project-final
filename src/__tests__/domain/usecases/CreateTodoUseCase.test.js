import { CreateTodoUseCase } from '../../../domain';
import { Todo } from '../../../domain';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('CreateTodoUseCase', () => {
  let useCase;
  let mockTodoRepository;

  beforeEach(() => {
    mockTodoRepository = {
      create: jest.fn()
    };
    useCase = new CreateTodoUseCase(mockTodoRepository);
  });

  const validTodoData = {
    title: 'Test Todo',
    description: 'Test Description',
    projectId: 'project123'
  };

  describe('execute', () => {
    it('should create todo with valid data', async () => {
      const createdTodo = Todo.create(validTodoData);
      mockTodoRepository.create.mockResolvedValue(createdTodo);

      const result = await useCase.execute(validTodoData);

      expect(mockTodoRepository.create).toHaveBeenCalledTimes(1);
      expect(mockTodoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: validTodoData.title,
          description: validTodoData.description,
          projectId: validTodoData.projectId
        })
      );
      expect(result).toBe(createdTodo);
    });

    it('should create todo without description', async () => {
      const todoWithoutDescription = {
        title: 'Test Todo',
        projectId: 'project123'
      };
      const createdTodo = Todo.create(todoWithoutDescription);
      mockTodoRepository.create.mockResolvedValue(createdTodo);

      const result = await useCase.execute(todoWithoutDescription);

      expect(mockTodoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: todoWithoutDescription.title,
          projectId: todoWithoutDescription.projectId
        })
      );
      expect(result).toBe(createdTodo);
    });

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        ...validTodoData,
        title: '' // Invalid empty title
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for missing title', async () => {
      const invalidData = {
        description: 'Test Description',
        projectId: 'project123'
        // Missing title
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for missing projectId', async () => {
      const invalidData = {
        title: 'Test Todo',
        description: 'Test Description'
        // Missing projectId
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for title too long', async () => {
      const invalidData = {
        ...validTodoData,
        title: 'a'.repeat(201) // Over 200 characters
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for description too long', async () => {
      const invalidData = {
        ...validTodoData,
        description: 'a'.repeat(501) // Over 500 characters
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockTodoRepository.create.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validTodoData)).rejects.toThrow('Database connection failed');
      expect(mockTodoRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create Todo entity before calling repository', async () => {
      const todoCreateSpy = jest.spyOn(Todo, 'create');
      const createdTodo = Todo.create(validTodoData);
      mockTodoRepository.create.mockResolvedValue(createdTodo);

      await useCase.execute(validTodoData);

      expect(todoCreateSpy).toHaveBeenCalledWith({
        title: validTodoData.title,
        description: validTodoData.description,
        projectId: validTodoData.projectId
      });

      todoCreateSpy.mockRestore();
    });

    it('should pass created todo to repository with correct structure', async () => {
      const createdTodo = Todo.create(validTodoData);
      mockTodoRepository.create.mockResolvedValue(createdTodo);

      await useCase.execute(validTodoData);

      const passedTodo = mockTodoRepository.create.mock.calls[0][0];
      expect(passedTodo).toBeInstanceOf(Todo);
      expect(passedTodo.title).toBe(validTodoData.title);
      expect(passedTodo.description).toBe(validTodoData.description);
      expect(passedTodo.projectId).toBe(validTodoData.projectId);
      expect(passedTodo.completed).toBe(false);
      expect(passedTodo.createdAt).toBeInstanceOf(Date);
      expect(passedTodo.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle undefined description correctly', async () => {
      const dataWithUndefinedDescription = {
        title: 'Test Todo',
        description: undefined,
        projectId: 'project123'
      };
      const createdTodo = Todo.create(dataWithUndefinedDescription);
      mockTodoRepository.create.mockResolvedValue(createdTodo);

      await useCase.execute(dataWithUndefinedDescription);

      const passedTodo = mockTodoRepository.create.mock.calls[0][0];
      expect(passedTodo.description).toBeUndefined();
    });

    it('should validate projectId format', async () => {
      const invalidData = {
        ...validTodoData,
        projectId: 123 // Should be string
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should validate title format', async () => {
      const invalidData = {
        ...validTodoData,
        title: 123 // Should be string
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });

    it('should validate description format when provided', async () => {
      const invalidData = {
        ...validTodoData,
        description: 123 // Should be string
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockTodoRepository.create).not.toHaveBeenCalled();
    });
  });
});