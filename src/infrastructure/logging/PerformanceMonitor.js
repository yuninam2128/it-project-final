import { infrastructureLogger } from './Logger.js';

export class PerformanceMonitor {
  constructor() {
    this.activeOperations = new Map();
  }

  startTimer(operationName, context = {}) {
    const startTime = performance.now();
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    
    this.activeOperations.set(operationId, {
      name: operationName,
      startTime,
      context
    });

    return operationId;
  }

  endTimer(operationId, additionalContext = {}) {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      infrastructureLogger.warn('Performance timer not found', { operationId });
      return;
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - operation.startTime);
    
    infrastructureLogger.performance(operation.name, duration, {
      ...operation.context,
      ...additionalContext
    });

    this.activeOperations.delete(operationId);
    return duration;
  }

  measureAsync(operationName, asyncFunction, context = {}) {
    return async (...args) => {
      const timerId = this.startTimer(operationName, context);
      try {
        const result = await asyncFunction(...args);
        this.endTimer(timerId, { success: true });
        return result;
      } catch (error) {
        this.endTimer(timerId, { success: false, error: error.message });
        throw error;
      }
    };
  }

  measureSync(operationName, syncFunction, context = {}) {
    return (...args) => {
      const timerId = this.startTimer(operationName, context);
      try {
        const result = syncFunction(...args);
        this.endTimer(timerId, { success: true });
        return result;
      } catch (error) {
        this.endTimer(timerId, { success: false, error: error.message });
        throw error;
      }
    };
  }

  // 메모리 사용량 모니터링 (브라우저 환경)
  getMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      return {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  logMemoryUsage(context = {}) {
    const memory = this.getMemoryUsage();
    if (memory) {
      infrastructureLogger.info('Memory usage', { ...memory, ...context });
    }
  }

  // 사용자 상호작용 추적
  trackUserAction(action, element, context = {}) {
    infrastructureLogger.businessEvent(`User action: ${action}`, {
      action,
      element,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // API 응답 시간 추적
  trackApiCall(endpoint, method, duration, statusCode, context = {}) {
    infrastructureLogger.performance(`API ${method} ${endpoint}`, duration, {
      endpoint,
      method,
      statusCode,
      ...context
    });
  }
}

// 전역 퍼포먼스 모니터
export const performanceMonitor = new PerformanceMonitor();