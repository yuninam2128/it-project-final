import { Project } from '../entities/Project.js';

export class CreateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute({
    title,
    description,
    priority,
    deadline,
    ownerId,
    position = null,
    subtasks = []
  }) {
    const project = Project.create({
      title,
      description,
      priority,
      deadline,
      ownerId,
      position,
      subtasks
    });

    return await this.projectRepository.create(project);
  }
}