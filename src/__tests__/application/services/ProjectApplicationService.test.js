import { ProjectApplicationService } from '../../../application/services/ProjectApplicationService.js';
import { CreateProjectUseCase } from '../../../domain/usecases/CreateProjectUseCase.js';
import { GetUserProjectsUseCase } from '../../../domain/usecases/GetUserProjectsUseCase.js';
import { UpdateProjectUseCase } from '../../../domain/usecases/UpdateProjectUseCase.js';
import { ProjectResponseDTO } from '../../../application/dto/ProjectDTO.js';
import { Project } from '../../../domain';

jest.mock('../../../domain/usecases/CreateProjectUseCase.js');
jest.mock('../../../domain/usecases/GetUserProjectsUseCase.js');
jest.mock('../../../domain/usecases/UpdateProjectUseCase.js');
jest.mock('../../../application/dto/ProjectDTO.js');

describe('ProjectApplicationService', () => {
  let service;
  let mockProjectRepository;
  let mockCreateProjectUseCase;
  let mockGetUserProjectsUseCase;
  let mockUpdateProjectUseCase;

  beforeEach(() => {
    mockProjectRepository = {
      getById: jest.fn(),
      delete: jest.fn(),
      subscribeToUserProjects: jest.fn()
    };

    mockCreateProjectUseCase = {
      execute: jest.fn()
    };
    mockGetUserProjectsUseCase = {
      execute: jest.fn()
    };
    mockUpdateProjectUseCase = {
      execute: jest.fn(),
      updatePosition: jest.fn(),
      updateMultiplePositions: jest.fn()
    };

    CreateProjectUseCase.mockImplementation(() => mockCreateProjectUseCase);
    GetUserProjectsUseCase.mockImplementation(() => mockGetUserProjectsUseCase);
    UpdateProjectUseCase.mockImplementation(() => mockUpdateProjectUseCase);

    service = new ProjectApplicationService(mockProjectRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize use cases with repository', () => {
      expect(CreateProjectUseCase).toHaveBeenCalledWith(mockProjectRepository);
      expect(GetUserProjectsUseCase).toHaveBeenCalledWith(mockProjectRepository);
      expect(UpdateProjectUseCase).toHaveBeenCalledWith(mockProjectRepository);
    });
  });

  describe('createProject', () => {
    const createProjectDTO = {
      title: 'Test Project',
      description: 'Test Description',
      ownerId: 'user123'
    };

    it('should create project successfully', async () => {
      const mockProject = Project.create(createProjectDTO);
      const mockResponseDTO = { id: 'project123', title: 'Test Project' };

      mockCreateProjectUseCase.execute.mockResolvedValue(mockProject);
      ProjectResponseDTO.fromEntity.mockReturnValue(mockResponseDTO);

      const result = await service.createProject(createProjectDTO);

      expect(mockCreateProjectUseCase.execute).toHaveBeenCalledWith(createProjectDTO);
      expect(ProjectResponseDTO.fromEntity).toHaveBeenCalledWith(mockProject);
      expect(result).toBe(mockResponseDTO);
    });

    it('should handle use case errors', async () => {
      const error = new Error('Validation failed');
      mockCreateProjectUseCase.execute.mockRejectedValue(error);

      await expect(service.createProject(createProjectDTO)).rejects.toThrow('Failed to create project: Validation failed');
    });
  });

  describe('getUserProjects', () => {
    const userId = 'user123';

    it('should get user projects successfully', async () => {
      const mockResult = {
        projects: [Project.create({ title: 'Project 1', ownerId: userId })],
        positions: { project1: { x: 100, y: 200 } }
      };
      const mockResponseDTOs = [{ id: 'project1', title: 'Project 1' }];

      mockGetUserProjectsUseCase.execute.mockResolvedValue(mockResult);
      ProjectResponseDTO.fromEntityList.mockReturnValue(mockResponseDTOs);

      const result = await service.getUserProjects(userId);

      expect(mockGetUserProjectsUseCase.execute).toHaveBeenCalledWith(userId);
      expect(ProjectResponseDTO.fromEntityList).toHaveBeenCalledWith(mockResult.projects);
      expect(result).toEqual({
        projects: mockResponseDTOs,
        positions: mockResult.positions
      });
    });

    it('should handle use case errors', async () => {
      const error = new Error('User not found');
      mockGetUserProjectsUseCase.execute.mockRejectedValue(error);

      await expect(service.getUserProjects(userId)).rejects.toThrow('Failed to get user projects: User not found');
    });
  });

  describe('getProject', () => {
    const projectId = 'project123';

    it('should get project successfully', async () => {
      const mockProject = Project.create({ title: 'Test Project', ownerId: 'user123' });
      const mockResponseDTO = { id: projectId, title: 'Test Project' };

      mockProjectRepository.getById.mockResolvedValue(mockProject);
      ProjectResponseDTO.fromEntity.mockReturnValue(mockResponseDTO);

      const result = await service.getProject(projectId);

      expect(mockProjectRepository.getById).toHaveBeenCalledWith(projectId);
      expect(ProjectResponseDTO.fromEntity).toHaveBeenCalledWith(mockProject);
      expect(result).toBe(mockResponseDTO);
    });

    it('should throw error when project not found', async () => {
      mockProjectRepository.getById.mockResolvedValue(null);

      await expect(service.getProject(projectId)).rejects.toThrow('Failed to get project: Project not found');
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockProjectRepository.getById.mockRejectedValue(error);

      await expect(service.getProject(projectId)).rejects.toThrow('Failed to get project: Database error');
    });
  });

  describe('updateProject', () => {
    const projectId = 'project123';
    const updateProjectDTO = {
      updates: { title: 'Updated Title' }
    };

    it('should update project successfully', async () => {
      const mockUpdatedProject = Project.create({ title: 'Updated Title', ownerId: 'user123' });
      const mockResponseDTO = { id: projectId, title: 'Updated Title' };

      mockUpdateProjectUseCase.execute.mockResolvedValue();
      mockProjectRepository.getById.mockResolvedValue(mockUpdatedProject);
      ProjectResponseDTO.fromEntity.mockReturnValue(mockResponseDTO);

      const result = await service.updateProject(projectId, updateProjectDTO);

      expect(mockUpdateProjectUseCase.execute).toHaveBeenCalledWith(projectId, updateProjectDTO.updates);
      expect(mockProjectRepository.getById).toHaveBeenCalledWith(projectId);
      expect(ProjectResponseDTO.fromEntity).toHaveBeenCalledWith(mockUpdatedProject);
      expect(result).toBe(mockResponseDTO);
    });

    it('should handle use case errors', async () => {
      const error = new Error('Update failed');
      mockUpdateProjectUseCase.execute.mockRejectedValue(error);

      await expect(service.updateProject(projectId, updateProjectDTO)).rejects.toThrow('Failed to update project: Update failed');
    });
  });

  describe('updateProjectPosition', () => {
    const projectId = 'project123';
    const position = { x: 100, y: 200, radius: 50 };

    it('should update project position successfully', async () => {
      mockUpdateProjectUseCase.updatePosition.mockResolvedValue();

      await service.updateProjectPosition(projectId, position);

      expect(mockUpdateProjectUseCase.updatePosition).toHaveBeenCalledWith(projectId, position);
    });

    it('should handle use case errors', async () => {
      const error = new Error('Position update failed');
      mockUpdateProjectUseCase.updatePosition.mockRejectedValue(error);

      await expect(service.updateProjectPosition(projectId, position)).rejects.toThrow('Failed to update project position: Position update failed');
    });
  });

  describe('updateMultipleProjectPositions', () => {
    const positionsUpdate = {
      project1: { x: 100, y: 200 },
      project2: { x: 300, y: 400 }
    };

    it('should update multiple project positions successfully', async () => {
      mockUpdateProjectUseCase.updateMultiplePositions.mockResolvedValue();

      await service.updateMultipleProjectPositions(positionsUpdate);

      expect(mockUpdateProjectUseCase.updateMultiplePositions).toHaveBeenCalledWith(positionsUpdate);
    });

    it('should handle use case errors', async () => {
      const error = new Error('Multiple positions update failed');
      mockUpdateProjectUseCase.updateMultiplePositions.mockRejectedValue(error);

      await expect(service.updateMultipleProjectPositions(positionsUpdate)).rejects.toThrow('Failed to update multiple project positions: Multiple positions update failed');
    });
  });

  describe('deleteProject', () => {
    const projectId = 'project123';

    it('should delete project successfully', async () => {
      mockProjectRepository.delete.mockResolvedValue();

      await service.deleteProject(projectId);

      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Delete failed');
      mockProjectRepository.delete.mockRejectedValue(error);

      await expect(service.deleteProject(projectId)).rejects.toThrow('Failed to delete project: Delete failed');
    });
  });

  describe('subscribeToUserProjects', () => {
    const userId = 'user123';

    it('should subscribe to user projects and transform results', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      const mockResult = {
        projects: [Project.create({ title: 'Project 1', ownerId: userId })],
        positions: { project1: { x: 100, y: 200 } }
      };
      const mockResponseDTOs = [{ id: 'project1', title: 'Project 1' }];

      ProjectResponseDTO.fromEntityList.mockReturnValue(mockResponseDTOs);
      mockProjectRepository.subscribeToUserProjects.mockImplementation((userId, callback) => {
        callback(mockResult);
        return mockUnsubscribe;
      });

      const unsubscribe = service.subscribeToUserProjects(userId, mockCallback);

      expect(mockProjectRepository.subscribeToUserProjects).toHaveBeenCalledWith(userId, expect.any(Function));
      expect(ProjectResponseDTO.fromEntityList).toHaveBeenCalledWith(mockResult.projects);
      expect(mockCallback).toHaveBeenCalledWith({
        projects: mockResponseDTOs,
        positions: mockResult.positions
      });
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should return unsubscribe function from repository', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockProjectRepository.subscribeToUserProjects.mockReturnValue(mockUnsubscribe);

      const unsubscribe = service.subscribeToUserProjects(userId, mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});