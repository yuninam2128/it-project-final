export class ProjectEventHandlers {
  static onProjectCreated(event) {
    console.log(`Project created: ${event.data.title}`, event);
    // 여기에 프로젝트 생성 시 추가 로직을 구현할 수 있습니다
    // 예: 이메일 알림, 통계 업데이트, 캐시 무효화 등
  }

  static onProjectUpdated(event) {
    console.log(`Project updated: ${event.aggregateId}`, event.data.changes);
    // 프로젝트 업데이트 시 로직
  }

  static onProjectDeleted(event) {
    console.log(`Project deleted: ${event.aggregateId}`);
    // 프로젝트 삭제 시 정리 작업
  }

  static onProjectProgressUpdated(event) {
    console.log(`Project progress updated: ${event.data.oldProgress}% → ${event.data.newProgress}%`);
    // 진행률 변경 시 알림이나 리포트 생성
  }
}

export class TodoEventHandlers {
  static onTodoCreated(event) {
    console.log(`Todo created in project ${event.data.projectId}: ${event.data.title}`);
    // Todo 생성 시 프로젝트 진행률 재계산 등
  }

  static onTodoCompleted(event) {
    console.log(`Todo completed: ${event.aggregateId}`);
    // Todo 완료 시 프로젝트 진행률 업데이트
  }

  static onTodoDeleted(event) {
    console.log(`Todo deleted: ${event.aggregateId}`);
    // Todo 삭제 시 정리 작업
  }
}

// 이벤트 핸들러 등록 헬퍼
export function registerEventHandlers(eventBus) {
  // Project events
  eventBus.subscribe('PROJECT_CREATED', ProjectEventHandlers.onProjectCreated);
  eventBus.subscribe('PROJECT_UPDATED', ProjectEventHandlers.onProjectUpdated);
  eventBus.subscribe('PROJECT_DELETED', ProjectEventHandlers.onProjectDeleted);
  eventBus.subscribe('PROJECT_PROGRESS_UPDATED', ProjectEventHandlers.onProjectProgressUpdated);

  // Todo events
  eventBus.subscribe('TODO_CREATED', TodoEventHandlers.onTodoCreated);
  eventBus.subscribe('TODO_COMPLETED', TodoEventHandlers.onTodoCompleted);
  eventBus.subscribe('TODO_DELETED', TodoEventHandlers.onTodoDeleted);
}