import { CreateProjectUseCase } from '../../domain/usecases/CreateProjectUseCase.js';
import { GetUserProjectsUseCase } from '../../domain/usecases/GetUserProjectsUseCase.js';
import { UpdateProjectUseCase } from '../../domain/usecases/UpdateProjectUseCase.js';
import { ProjectResponseDTO } from '../dto/ProjectDTO.js';

export class ProjectApplicationService {
  constructor(projectRepository) {
    this.createProjectUseCase = new CreateProjectUseCase(projectRepository);
    this.getUserProjectsUseCase = new GetUserProjectsUseCase(projectRepository);
    this.updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
    this.projectRepository = projectRepository;
  }

  async createProject(createProjectDTO) {
    try {
      const project = await this.createProjectUseCase.execute(createProjectDTO);
      return ProjectResponseDTO.fromEntity(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async getUserProjects(userId) {
    try {
      const result = await this.getUserProjectsUseCase.execute(userId);
      return {
        projects: ProjectResponseDTO.fromEntityList(result.projects),
        positions: result.positions
      };
    } catch (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }
  }

  async getProject(projectId) {
    try {
      const project = await this.projectRepository.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      return ProjectResponseDTO.fromEntity(project);
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  async updateProject(projectId, updateProjectDTO) {
    try {
      await this.updateProjectUseCase.execute(projectId, updateProjectDTO.updates);
      const updatedProject = await this.projectRepository.getById(projectId);
      return ProjectResponseDTO.fromEntity(updatedProject);
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async updateProjectPosition(projectId, position) {
    try {
      await this.updateProjectUseCase.updatePosition(projectId, position);
    } catch (error) {
      throw new Error(`Failed to update project position: ${error.message}`);
    }
  }

  async updateMultipleProjectPositions(positionsUpdate) {
    try {
      await this.updateProjectUseCase.updateMultiplePositions(positionsUpdate);
    } catch (error) {
      throw new Error(`Failed to update multiple project positions: ${error.message}`);
    }
  }

  async deleteProject(projectId) {
    try {
      await this.projectRepository.delete(projectId);
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  subscribeToUserProjects(userId, callback) {
    return this.projectRepository.subscribeToUserProjects(userId, (result) => {
      const transformedResult = {
        projects: ProjectResponseDTO.fromEntityList(result.projects),
        positions: result.positions
      };
      callback(transformedResult);
    });
  }
}