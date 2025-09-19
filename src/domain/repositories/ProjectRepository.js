export class ProjectRepository {
  async create(project) {
    throw new Error('create method must be implemented');
  }

  async getById(id) {
    throw new Error('getById method must be implemented');
  }

  async getByUserId(userId) {
    throw new Error('getByUserId method must be implemented');
  }

  async update(id, updates) {
    throw new Error('update method must be implemented');
  }

  async updatePosition(id, position) {
    throw new Error('updatePosition method must be implemented');
  }

  async updateMultiplePositions(positionsUpdate) {
    throw new Error('updateMultiplePositions method must be implemented');
  }

  async delete(id) {
    throw new Error('delete method must be implemented');
  }

  subscribeToUserProjects(userId, callback) {
    throw new Error('subscribeToUserProjects method must be implemented');
  }
}