export class Logger {
  constructor(context = 'Application') {
    this.context = context;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId()
    };
  }

  getSessionId() {
    // 세션 ID 생성/조회 로직
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  }

  getCurrentUserId() {
    // 현재 사용자 ID 조회 로직 (Firebase Auth 등에서)
    if (typeof window !== 'undefined' && window.firebase) {
      const user = window.firebase.auth().currentUser;
      return user ? user.uid : 'anonymous';
    }
    return 'unknown';
  }

  debug(message, data = {}) {
    if (!this.isProduction) {
      const entry = this.createLogEntry('DEBUG', message, data);
      console.debug('🐛', entry);
    }
  }

  info(message, data = {}) {
    const entry = this.createLogEntry('INFO', message, data);
    console.info('ℹ️', entry);
    this.sendToExternalService(entry);
  }

  warn(message, data = {}) {
    const entry = this.createLogEntry('WARN', message, data);
    console.warn('⚠️', entry);
    this.sendToExternalService(entry);
  }

  error(message, error = null, data = {}) {
    const errorData = {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    };
    
    const entry = this.createLogEntry('ERROR', message, errorData);
    console.error('❌', entry);
    this.sendToExternalService(entry);
  }

  performance(operation, duration, data = {}) {
    const entry = this.createLogEntry('PERFORMANCE', `${operation} completed`, {
      ...data,
      operation,
      duration: `${duration}ms`
    });
    
    if (duration > 1000) {
      console.warn('⏱️ Slow operation:', entry);
    } else {
      console.info('⏱️ Performance:', entry);
    }
    
    this.sendToExternalService(entry);
  }

  businessEvent(event, data = {}) {
    const entry = this.createLogEntry('BUSINESS_EVENT', event, data);
    console.info('🏢', entry);
    this.sendToExternalService(entry);
  }

  sendToExternalService(logEntry) {
    // 프로덕션 환경에서 외부 로깅 서비스로 전송
    // 예: Sentry, LogRocket, CloudWatch 등
    if (this.isProduction) {
      // 실제 구현 시 외부 서비스 API 호출
      // this.externalLogger.send(logEntry);
    }
  }

  createChildLogger(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }
}

// 전역 로거 인스턴스들
export const applicationLogger = new Logger('Application');
export const domainLogger = new Logger('Domain');
export const infrastructureLogger = new Logger('Infrastructure');
export const presentationLogger = new Logger('Presentation');