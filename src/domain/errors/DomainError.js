export class DomainError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends DomainError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', { field, value });
  }
}

export class NotFoundError extends DomainError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id });
  }
}

export class UnauthorizedError extends DomainError {
  constructor(action, resource) {
    super(`Unauthorized to ${action} ${resource}`, 'UNAUTHORIZED', { action, resource });
  }
}

export class BusinessRuleError extends DomainError {
  constructor(rule, context = {}) {
    super(`Business rule violation: ${rule}`, 'BUSINESS_RULE_VIOLATION', context);
  }
}

export class InfrastructureError extends DomainError {
  constructor(message, originalError) {
    super(message, 'INFRASTRUCTURE_ERROR', { originalError: originalError.message });
  }
}