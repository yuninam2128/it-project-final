import { Todo } from '../entities/Todo.js';

export class CreateTodoUseCase {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute({
    title,
    description,
    projectId
  }) {
    const todo = Todo.create({
      title,
      description,
      projectId
    });

    return await this.todoRepository.create(todo);
  }
}