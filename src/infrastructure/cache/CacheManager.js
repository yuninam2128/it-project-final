import { infrastructureLogger } from '../logging/Logger.js';
import { appConfig } from '../config/AppConfig.js';

export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.expiry = new Map();
    this.defaultTTL = appConfig.get('performance.cacheTimeout', 300000); // 5 minutes
    this.maxSize = 1000; // Maximum number of cached items
    
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  set(key, value, ttl = this.defaultTTL) {
    try {
      // Remove oldest items if cache is full
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }

      const expiryTime = Date.now() + ttl;
      this.cache.set(key, value);
      this.expiry.set(key, expiryTime);

      infrastructureLogger.debug('Cache set', { key, ttl });
    } catch (error) {
      infrastructureLogger.error('Cache set failed', error, { key });
    }
  }

  get(key) {
    try {
      if (!this.cache.has(key)) {
        infrastructureLogger.debug('Cache miss', { key });
        return null;
      }

      const expiryTime = this.expiry.get(key);
      if (expiryTime && Date.now() > expiryTime) {
        this.delete(key);
        infrastructureLogger.debug('Cache expired', { key });
        return null;
      }

      const value = this.cache.get(key);
      infrastructureLogger.debug('Cache hit', { key });
      return value;
    } catch (error) {
      infrastructureLogger.error('Cache get failed', error, { key });
      return null;
    }
  }

  delete(key) {
    this.cache.delete(key);
    this.expiry.delete(key);
    infrastructureLogger.debug('Cache deleted', { key });
  }

  clear() {
    this.cache.clear();
    this.expiry.clear();
    infrastructureLogger.info('Cache cleared');
  }

  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const expiryTime = this.expiry.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      this.delete(key);
      return false;
    }

    return true;
  }

  evictOldest() {
    // Find the item with the earliest expiry time
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, expiryTime] of this.expiry.entries()) {
      if (expiryTime < oldestTime) {
        oldestTime = expiryTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      infrastructureLogger.debug('Cache evicted oldest item', { key: oldestKey });
    }
  }

  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expiryTime] of this.expiry.entries()) {
      if (expiryTime <= now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0) {
      infrastructureLogger.debug('Cache cleanup completed', { expiredCount: expiredKeys.length });
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Project-specific cache helpers
export class ProjectCacheManager extends CacheManager {
  setProject(projectId, project, ttl) {
    const key = this.generateKey('project', projectId);
    this.set(key, project, ttl);
  }

  getProject(projectId) {
    const key = this.generateKey('project', projectId);
    return this.get(key);
  }

  setUserProjects(userId, projects, ttl) {
    const key = this.generateKey('user_projects', userId);
    this.set(key, projects, ttl);
  }

  getUserProjects(userId) {
    const key = this.generateKey('user_projects', userId);
    return this.get(key);
  }

  invalidateProject(projectId) {
    const projectKey = this.generateKey('project', projectId);
    this.delete(projectKey);
    
    // Also invalidate user projects cache (we don't know which user, so clear all user caches)
    this.invalidateUserProjectsCaches();
  }

  invalidateUserProjectsCaches() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('user_projects:')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.delete(key));
  }
}

export class TodoCacheManager extends CacheManager {
  setProjectTodos(projectId, todos, ttl) {
    const key = this.generateKey('project_todos', projectId);
    this.set(key, todos, ttl);
  }

  getProjectTodos(projectId) {
    const key = this.generateKey('project_todos', projectId);
    return this.get(key);
  }

  setTodo(todoId, todo, ttl) {
    const key = this.generateKey('todo', todoId);
    this.set(key, todo, ttl);
  }

  getTodo(todoId) {
    const key = this.generateKey('todo', todoId);
    return this.get(key);
  }

  invalidateTodo(todoId) {
    const todoKey = this.generateKey('todo', todoId);
    this.delete(todoKey);
  }

  invalidateProjectTodos(projectId) {
    const key = this.generateKey('project_todos', projectId);
    this.delete(key);
  }
}

// Global cache instances
export const projectCache = new ProjectCacheManager();
export const todoCache = new TodoCacheManager();