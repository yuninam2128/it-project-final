export class UpdateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId, updates) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const project = await this.projectRepository.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return await this.projectRepository.update(projectId, updates);
  }

  async updatePosition(projectId, position) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    return await this.projectRepository.updatePosition(projectId, position);
  }

  async updateMultiplePositions(positionsUpdate) {
    return await this.projectRepository.updateMultiplePositions(positionsUpdate);
  }
}