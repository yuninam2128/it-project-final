import React, { useState } from "react";
import TodoItem from "./TodoItem";
import "./TodoBox.css";

function TodoBox({ todos = [], onUpdateTodos, showAddInput = false, selectedDate = new Date() }) {
  const [newTodoText, setNewTodoText] = useState("");

  const completedCount = todos.filter(todo => todo.progress === 100).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const updateTodoProgress = (todoId, newProgress) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId
        ? { ...todo, progress: newProgress, completed: newProgress === 100 }
        : todo
    );

    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  const deleteTodo = (todoId) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);

    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  const postponeTodo = (todoId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const currentDate = new Date(todo.date);
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = nextDate.toISOString().split('T')[0];
        return { ...todo, date: nextDateString };
      }
      return todo;
    });

    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  const addNewTodo = () => {
    if (!newTodoText.trim()) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      progress: 0,
      date: dateKey,
      completed: false
    };

    const updatedTodos = [...todos, newTodo];
    setNewTodoText("");

    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addNewTodo();
    }
  };

  return (
    <div className="todo-box">
      {/* 새 할 일 입력 필드 (showAddInput이 true일 때만) - Figma 101 입력박스 */}
      {showAddInput && (
        <div className="todo-input-section">
          <button onClick={addNewTodo} className="todo-add-btn-icon" title="할 일 추가" aria-label="할 일 추가">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="할 일을 입력하세요"
            className="todo-input"
            autoFocus
          />
        </div>
      )}

      {/* 투두 아이템 목록 */}
      <div className="todo-items-section">
        {todos.length === 0 ? (
          <p className="empty-state">할 일을 추가해보세요 👋</p>
        ) : (
          <ul className="todo-items-list">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdateProgress={updateTodoProgress}
                onDelete={deleteTodo}
                onPostpone={postponeTodo}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TodoBox;
