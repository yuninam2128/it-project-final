// Domain Types - TypeScript definitions for future migration

export interface Position {
  x: number;
  y: number;
  radius?: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectData {
  id?: string;
  title: string;
  description?: string;
  priority?: Priority;
  deadline?: string;
  progress?: number;
  ownerId: string;
  position?: Position | null;
  subtasks?: SubtaskData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProjectData {
  title: string;
  description?: string;
  priority?: Priority;
  deadline?: string;
  ownerId: string;
  position?: Position | null;
  subtasks?: SubtaskData[];
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  priority?: Priority;
  deadline?: string;
  progress?: number;
  position?: Position | null;
  subtasks?: SubtaskData[];
}

export interface SubtaskData {
  id?: string;
  title: string;
  completed: boolean;
}

export interface TodoData {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  projectId: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface UserData {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Repository Interfaces
export interface IProjectRepository {
  create(project: ProjectData): Promise<ProjectData>;
  getById(id: string): Promise<ProjectData | null>;
  getByUserId(userId: string): Promise<{ projects: ProjectData[]; positions: Record<string, Position> }>;
  update(id: string, updates: UpdateProjectData): Promise<void>;
  updatePosition(id: string, position: Position): Promise<void>;
  updateMultiplePositions(positionsUpdate: Record<string, Position>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToUserProjects(userId: string, callback: (result: { projects: ProjectData[]; positions: Record<string, Position> }) => void): () => void;
}

export interface ITodoRepository {
  create(todo: TodoData): Promise<TodoData>;
  getById(id: string): Promise<TodoData | null>;
  getByProjectId(projectId: string): Promise<TodoData[]>;
  update(id: string, updates: UpdateTodoData): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository {
  create(user: UserData): Promise<UserData>;
  getById(id: string): Promise<UserData | null>;
  getByEmail(email: string): Promise<UserData | null>;
  update(id: string, updates: Partial<UserData>): Promise<void>;
  delete(id: string): Promise<void>;
}