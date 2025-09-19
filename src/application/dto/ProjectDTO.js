export class CreateProjectDTO {
  constructor({
    title,
    description,
    priority,
    deadline,
    ownerId,
    position = null,
    subtasks = []
  }) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.deadline = deadline;
    this.ownerId = ownerId;
    this.position = position;
    this.subtasks = subtasks;
  }

  static fromRequest(requestData) {
    return new CreateProjectDTO({
      title: requestData.title,
      description: requestData.description,
      priority: requestData.priority,
      deadline: requestData.deadline,
      ownerId: requestData.ownerId,
      position: requestData.position,
      subtasks: requestData.subtasks || []
    });
  }
}

export class UpdateProjectDTO {
  constructor(updates) {
    this.updates = { ...updates };
  }

  static fromRequest(requestData) {
    const allowedFields = [
      'title', 
      'description', 
      'priority', 
      'deadline', 
      'progress', 
      'subtasks'
    ];
    
    const filteredUpdates = Object.keys(requestData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = requestData[key];
        return obj;
      }, {});

    return new UpdateProjectDTO(filteredUpdates);
  }
}

export class ProjectResponseDTO {
  constructor(project) {
    this.id = project.id;
    this.title = project.title;
    this.description = project.description;
    this.priority = project.priority;
    this.deadline = project.deadline;
    this.progress = project.progress;
    this.ownerId = project.ownerId;
    this.position = project.position;
    this.subtasks = project.subtasks;
    this.createdAt = project.createdAt;
    this.updatedAt = project.updatedAt;
  }

  static fromEntity(project) {
    return new ProjectResponseDTO(project);
  }

  static fromEntityList(projects) {
    return projects.map(project => new ProjectResponseDTO(project));
  }
}