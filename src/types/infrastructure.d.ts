// Infrastructure Types

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  context: string;
  message: string;
  data: Record<string, any>;
  sessionId: string;
  userId: string;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  defaultTTL: number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  context: Record<string, any>;
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface AppConfiguration {
  app: {
    name: string;
    version: string;
    debugMode: boolean;
  };
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  features: {
    enableRealTimeUpdates: boolean;
    enableOfflineMode: boolean;
    enableAnalytics: boolean;
    enablePerformanceMonitoring: boolean;
    maxProjectsPerUser: number;
    maxTodosPerProject: number;
  };
  ui: {
    theme: string;
    language: string;
    autoSaveInterval: number;
    debounceDelay: number;
  };
  performance: {
    cacheTimeout: number;
    maxRetries: number;
    retryDelay: number;
  };
  logging: {
    level: keyof LogLevel;
    enableConsoleLogging: boolean;
    enableRemoteLogging: boolean;
  };
}

export interface DomainEventData {
  eventId: string;
  eventType: string;
  aggregateId: string;
  data: Record<string, any>;
  timestamp: string;
  version: number;
}

export interface EventHandler {
  (event: DomainEventData): Promise<void> | void;
}

export interface EventMiddleware {
  (event: DomainEventData): Promise<DomainEventData | null> | DomainEventData | null;
}