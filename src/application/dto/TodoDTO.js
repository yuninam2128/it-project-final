export class CreateTodoDTO {
  constructor({
    title,
    description,
    projectId
  }) {
    this.title = title;
    this.description = description;
    this.projectId = projectId;
  }

  static fromRequest(requestData) {
    return new CreateTodoDTO({
      title: requestData.title,
      description: requestData.description,
      projectId: requestData.projectId
    });
  }
}

export class UpdateTodoDTO {
  constructor(updates) {
    this.updates = { ...updates };
  }

  static fromRequest(requestData) {
    const allowedFields = ['title', 'description', 'completed'];
    
    const filteredUpdates = Object.keys(requestData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = requestData[key];
        return obj;
      }, {});

    return new UpdateTodoDTO(filteredUpdates);
  }
}

export class TodoResponseDTO {
  constructor(todo) {
    this.id = todo.id;
    this.title = todo.title;
    this.description = todo.description;
    this.completed = todo.completed;
    this.projectId = todo.projectId;
    this.createdAt = todo.createdAt;
    this.updatedAt = todo.updatedAt;
  }

  static fromEntity(todo) {
    return new TodoResponseDTO(todo);
  }

  static fromEntityList(todos) {
    return todos.map(todo => new TodoResponseDTO(todo));
  }
}