import { CreateTodoUseCase } from '../../domain/usecases/CreateTodoUseCase.js';
import { GetProjectTodosUseCase } from '../../domain/usecases/GetProjectTodosUseCase.js';
import { TodoResponseDTO } from '../dto/TodoDTO.js';

export class TodoApplicationService {
  constructor(todoRepository) {
    this.createTodoUseCase = new CreateTodoUseCase(todoRepository);
    this.getProjectTodosUseCase = new GetProjectTodosUseCase(todoRepository);
    this.todoRepository = todoRepository;
  }

  async createTodo(createTodoDTO) {
    try {
      const todo = await this.createTodoUseCase.execute(createTodoDTO);
      return TodoResponseDTO.fromEntity(todo);
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }
  }

  async getProjectTodos(projectId) {
    try {
      const todos = await this.getProjectTodosUseCase.execute(projectId);
      return TodoResponseDTO.fromEntityList(todos);
    } catch (error) {
      throw new Error(`Failed to get project todos: ${error.message}`);
    }
  }

  async getTodo(todoId) {
    try {
      const todo = await this.todoRepository.getById(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }
      return TodoResponseDTO.fromEntity(todo);
    } catch (error) {
      throw new Error(`Failed to get todo: ${error.message}`);
    }
  }

  async updateTodo(todoId, updateTodoDTO) {
    try {
      await this.todoRepository.update(todoId, updateTodoDTO.updates);
      const updatedTodo = await this.todoRepository.getById(todoId);
      return TodoResponseDTO.fromEntity(updatedTodo);
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }

  async deleteTodo(todoId) {
    try {
      await this.todoRepository.delete(todoId);
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }
}