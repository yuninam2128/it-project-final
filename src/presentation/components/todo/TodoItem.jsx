import { useState } from "react";
import "./TodoItem.css";

function TodoItem({ todo, onUpdateProgress, onDelete, onPostpone, mode = 'today', onEditText }) {
  const [, setHoveredTodoId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

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

  const handleEditSave = () => {
    if (editText.trim() && onEditText) {
      onEditText(todo.id, editText);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
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
            {isEditing && mode === 'subtask' ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyPress}
                autoFocus
                className="todo-edit-input"
              />
            ) : (
              <>
                <span className={`todo-text ${todo.progress === 100 ? 'completed' : ''}`}>
                  {todo.text}
                </span>
                {todo.progress === 100 && <span className="todo-badge">완료</span>}
              </>
            )}
          </div>
        </div>

        <div className="todo-buttons">
          {isEditing && mode === 'subtask' ? (
            <>
              <button
                className="todo-save-btn"
                onClick={handleEditSave}
                title="저장"
              >
                ✓
              </button>
              <button
                className="todo-cancel-btn"
                onClick={handleEditCancel}
                title="취소"
              >
                ✕
              </button>
            </>
          ) : mode === 'subtask' ? (
            <>
              <button
                className="todo-edit-btn"
                onClick={() => setIsEditing(true)}
                title="text 수정"
              >
                ✎
              </button>
              <button
                className="todo-delete-btn"
                onClick={() => onDelete(todo.id)}
                title="삭제"
              >
                ✕
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export default TodoItem;
