import { useState } from "react";
import "./TodoItem.css";

function TodoItem({ todo, onUpdateProgress, onDelete, onPostpone }) {
  const [, setHoveredTodoId] = useState(null);

  const handleProgressChange = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    onUpdateProgress(todo.id, percentage);
  };

  const handleProgressDrag = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const handleMouseMove = (moveEvent) => {
      const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      const percentage = Math.round((x / rect.width) * 100);
      onUpdateProgress(todo.id, percentage);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    handleMouseMove(e);
  };

  return (
    <li
      className={`todo-item ${todo.progress === 100 ? 'completed' : ''}`}
      onMouseEnter={() => setHoveredTodoId(todo.id)}
      onMouseLeave={() => setHoveredTodoId(null)}
    >
      <div className="todo-content">
        <div className="todo-progress-section">
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              onMouseDown={handleProgressDrag}
              onClick={handleProgressChange}
            >
              <div
                className={`progress-fill ${todo.progress === 100 ? 'completed' : ''}`}
                style={{ width: `${todo.progress}%` }}
              />
              {todo.progress > 0 && (
                <span className="progress-text">{todo.progress}%</span>
              )}
            </div>
          </div>

          <div className="todo-text-wrapper">
            <span className={`todo-text ${todo.progress === 100 ? 'completed' : ''}`}>
              {todo.text}
            </span>
            {todo.progress === 100 && <span className="todo-badge">완료</span>}
          </div>
        </div>

        <div className="todo-buttons">
          <button
            className="todo-postpone-btn"
            onClick={() => onPostpone && onPostpone(todo.id)}
            title="다음 날짜로 이동"
          >
            →
          </button>
          <button
            className="todo-delete-btn"
            onClick={() => onDelete(todo.id)}
            title="삭제"
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}

export default TodoItem;
