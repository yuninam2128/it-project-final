import { FirebaseProjectRepository } from '../repositories/FirebaseProjectRepository.js';
import { FirebaseTodoRepository } from '../repositories/FirebaseTodoRepository.js';
import { AuthService } from '../services/AuthService.js';
import { ProjectApplicationService } from '../../application/services/ProjectApplicationService.js';
import { TodoApplicationService } from '../../application/services/TodoApplicationService.js';

class DIContainer {
  constructor() {
    this.services = new Map();
    this.repositories = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Initialize repositories
    this.repositories.set('projectRepository', new FirebaseProjectRepository());
    this.repositories.set('todoRepository', new FirebaseTodoRepository());

    // Initialize services
    this.services.set('authService', new AuthService());
    this.services.set(
      'projectApplicationService', 
      new ProjectApplicationService(this.repositories.get('projectRepository'))
    );
    this.services.set(
      'todoApplicationService', 
      new TodoApplicationService(this.repositories.get('todoRepository'))
    );

    this.initialized = true;
  }

  getRepository(name) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.repositories.get(name);
  }

  getService(name) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.services.get(name);
  }

  // Convenience methods for commonly used services
  getProjectApplicationService() {
    return this.getService('projectApplicationService');
  }

  getTodoApplicationService() {
    return this.getService('todoApplicationService');
  }

  getAuthService() {
    return this.getService('authService');
  }
}

// Create singleton instance
const container = new DIContainer();

export { container as DIContainer };