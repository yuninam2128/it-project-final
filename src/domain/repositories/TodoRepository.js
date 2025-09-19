export class TodoRepository {
  async create(todo) {
    throw new Error('create method must be implemented');
  }

  async getById(id) {
    throw new Error('getById method must be implemented');
  }

  async getByProjectId(projectId) {
    throw new Error('getByProjectId method must be implemented');
  }

  async update(id, updates) {
    throw new Error('update method must be implemented');
  }

  async delete(id) {
    throw new Error('delete method must be implemented');
  }
}