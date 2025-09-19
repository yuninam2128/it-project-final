import { CreateProjectUseCase } from '../../../domain';
import { Project } from '../../../domain';
import { ValidationError } from '../../../domain/errors/DomainError.js';

describe('CreateProjectUseCase', () => {
  let useCase;
  let mockProjectRepository;

  beforeEach(() => {
    mockProjectRepository = {
      create: jest.fn()
    };
    useCase = new CreateProjectUseCase(mockProjectRepository);
  });

  const validProjectData = {
    title: 'Test Project',
    description: 'Test Description',
    priority: 'high',
    deadline: '2025-12-31',
    ownerId: 'user123'
  };

  describe('execute', () => {
    it('should create project with valid data', async () => {
      const createdProject = Project.create(validProjectData);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      const result = await useCase.execute(validProjectData);

      expect(mockProjectRepository.create).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: validProjectData.title,
          description: validProjectData.description,
          priority: validProjectData.priority,
          deadline: validProjectData.deadline,
          ownerId: validProjectData.ownerId
        })
      );
      expect(result).toBe(createdProject);
    });

    it('should create project with optional fields', async () => {
      const projectDataWithOptionals = {
        ...validProjectData,
        position: { x: 100, y: 200, radius: 50 },
        subtasks: [{ title: 'Subtask 1' }]
      };
      const createdProject = Project.create(projectDataWithOptionals);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      const result = await useCase.execute(projectDataWithOptionals);

      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          position: projectDataWithOptionals.position
        })
      );
      expect(result).toBe(createdProject);
    });

    it('should create project with default values for optional fields', async () => {
      const minimalData = {
        title: 'Minimal Project',
        ownerId: 'user123'
      };
      const createdProject = Project.create(minimalData);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      await useCase.execute(minimalData);

      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: minimalData.title,
          ownerId: minimalData.ownerId
        })
      );
    });

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        ...validProjectData,
        title: '' // Invalid empty title
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for missing required fields', async () => {
      const invalidData = {
        description: 'Test Description',
        priority: 'high'
        // Missing title and ownerId
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow(ValidationError);
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockProjectRepository.create.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validProjectData)).rejects.toThrow('Database connection failed');
      expect(mockProjectRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle null position correctly', async () => {
      const dataWithNullPosition = {
        ...validProjectData,
        position: null
      };
      const createdProject = Project.create(dataWithNullPosition);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      await useCase.execute(dataWithNullPosition);

      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          position: null
        })
      );
    });

    it('should handle empty subtasks array correctly', async () => {
      const dataWithEmptySubtasks = {
        ...validProjectData,
        subtasks: []
      };
      const createdProject = Project.create(dataWithEmptySubtasks);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      await useCase.execute(dataWithEmptySubtasks);

      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subtasks: []
        })
      );
    });

    it('should create Project entity before calling repository', async () => {
      const projectCreateSpy = jest.spyOn(Project, 'create');
      const createdProject = Project.create(validProjectData);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      await useCase.execute(validProjectData);

      expect(projectCreateSpy).toHaveBeenCalledWith({
        title: validProjectData.title,
        description: validProjectData.description,
        priority: validProjectData.priority,
        deadline: validProjectData.deadline,
        ownerId: validProjectData.ownerId,
        position: null,
        subtasks: []
      });

      projectCreateSpy.mockRestore();
    });

    it('should pass created project to repository with correct structure', async () => {
      const createdProject = Project.create(validProjectData);
      mockProjectRepository.create.mockResolvedValue(createdProject);

      await useCase.execute(validProjectData);

      const passedProject = mockProjectRepository.create.mock.calls[0][0];
      expect(passedProject).toBeInstanceOf(Project);
      expect(passedProject.title).toBe(validProjectData.title);
      expect(passedProject.ownerId).toBe(validProjectData.ownerId);
      expect(passedProject.progress).toBe(0);
      expect(passedProject.createdAt).toBeInstanceOf(Date);
      expect(passedProject.updatedAt).toBeInstanceOf(Date);
    });
  });
});