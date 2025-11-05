import TodoBox from "./TodoBox";
import "./TodaysTodo.css";

function TodaysTodo({ todos = [], onUpdateTodos, date = new Date() }) {
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const currentDateKey = getDateKey(date);
  const todayTodos = todos.filter(todo => todo.date === currentDateKey);
  const completedCount = todayTodos.filter(todo => todo.progress === 100).length;

  const handleUpdateTodos = (updatedTodos) => {
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
