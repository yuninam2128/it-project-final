import TodoBox from "./TodoBox";
import "./TodaysTodo.css";
import { useState } from "react";

function TodaysTodo({ todos = [], onUpdateTodos, date = new Date() }) {
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const currentDateKey = getDateKey(date);

  // 예시 투두 리스트 (첫 렌더링 시에만 사용)
  const defaultTodos = [
    { id: 1, text: "프로젝트 기획서 작성", progress: 100, date: currentDateKey, completed: true },
    { id: 2, text: "팀 회의 자료 준비", progress: 50, date: currentDateKey, completed: false },
    { id: 3, text: "코드 리뷰 완료하기", progress: 0, date: currentDateKey, completed: false },
    { id: 4, text: "버그 수정 및 테스트", progress: 75, date: currentDateKey, completed: false },
    { id: 5, text: "데이터베이스 최적화", progress: 25, date: currentDateKey, completed: false },
    { id: 6, text: "API 문서 작성", progress: 60, date: currentDateKey, completed: false },
    { id: 7, text: "UI/UX 디자인 검토", progress: 0, date: currentDateKey, completed: false },
    { id: 8, text: "배포 준비", progress: 40, date: currentDateKey, completed: false },
    { id: 9, text: "클라이언트 피드백 수렴", progress: 100, date: currentDateKey, completed: true },
    { id: 10, text: "내일 일정 계획", progress: 0, date: currentDateKey, completed: false }
  ];

  const [todosState, setTodosState] = useState(todos.length === 0 ? defaultTodos : todos);

  const todayTodos = todosState.filter(todo => todo.date === currentDateKey);
  const completedCount = todayTodos.filter(todo => todo.progress === 100).length;

  const handleUpdateTodos = (updatedTodos) => {
    setTodosState(updatedTodos);
    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  return (
    <div className="todays-todo">
      <div className="todo-header-section">
        <div className="todo-header-top">
          <h2 className="todo-title">오늘의 할 일</h2>
          <span className="todo-count">총 {completedCount}개 완료</span>
        </div>
      </div>

      <TodoBox todos={todayTodos} onUpdateTodos={handleUpdateTodos} />
    </div>
  );
}

export default TodaysTodo;
