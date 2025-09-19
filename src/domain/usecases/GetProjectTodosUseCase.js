export class GetProjectTodosUseCase {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    return await this.todoRepository.getByProjectId(projectId);
  }
}