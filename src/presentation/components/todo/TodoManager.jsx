import React, { useState } from "react";

// 기존 TodoManager.css 스타일과 동일하게 유지
const styles = `
.todo-bar {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.todo-container {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: white;
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6c757d;
  text-align: center;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 500;
}

.placeholder-subtext {
  font-size: 14px;
  opacity: 0.7;
  line-height: 1.5;
}

.todo-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.todo-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.todo-subtitle {
  color: #6c757d;
  font-size: 14px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #007bff;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: #e9ecef;
}

.month-year {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.calendar-days {
  margin-bottom: 20px;
}

.calendar-days > div {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  font-weight: 500;
  position: relative;
}

.day:hover:not(.disabled) {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.day.today {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.day.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.day.has-todos {
  background-color: #d4edda;
  border-color: #28a745;
}

.day.has-todos:hover {
  background-color: #c3e6cb;
}

.day.has-todos::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background-color: #28a745;
  border-radius: 50%;
}

.task-input {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.task-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.task-input input:focus {
  border-color: #007bff;
}

.add-task-btn {
  padding: 12px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-task-btn:hover {
  background-color: #0056b3;
}

.task-list {
  flex: 1;
}

.task-list h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px 20px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-item.completed {
  background-color: #f8f9fa;
  opacity: 0.8;
}

.progress-bar {
  position: relative;
  width: 80px;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #007bff;
  border-radius: 10px;
  transition: width 0.2s ease;
}

.progress.completed {
  background-color: #28a745;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.progress-handle {
  position: absolute;
  top: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border: 2px solid #007bff;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.progress-handle.completed {
  border-color: #28a745;
}

.task-title {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.task-title.completed {
  text-decoration: line-through;
  color: #6c757d;
}

.task-options {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.task-options:hover {
  background-color: #f8d7da;
}

.date-selection-guide {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6c757d;
  text-align: center;
}

.date-selection-guide h4 {
  margin-bottom: 8px;
  color: #495057;
}

.date-selection-guide p {
  line-height: 1.5;
  opacity: 0.8;
}
`;

// 해당 날짜가 몇 번째 주차인지 반환 : Date객체 -> number
const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const adjustedDate = date.getDate() + firstDayWeekday - 1;
  return Math.ceil(adjustedDate / 7);
};

// 시작~종료 날짜 사이의 모든 주차(월 n주차) 목록 반환
const getWeeksInRange = (startDate, endDate) => {
  const weeks = new Set();
  const current = new Date(startDate);
  while (current <= endDate) {
    const weekNum = getWeekNumber(current);
    const monthName = current.toLocaleDateString('ko-KR', { month: 'long' });
    weeks.add(`${monthName} ${weekNum}주차`);
    current.setDate(current.getDate() + 1);
  }
  return Array.from(weeks);
};

// 해당 연/월/주차에 포함되는 날짜(일) 배열 반환
const getDaysInWeek = (year, month, weekNumber) => {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDay.getDay();
  const startDate = (weekNumber - 1) * 7 - firstDayWeekday + 1;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = startDate + i;
    if (dayDate > 0) {
      const date = new Date(year, month - 1, dayDate);
      if (date.getMonth() === month - 1) {
        days.push(dayDate);
      }
    }
  }
  return days;
};

// date가 startDate~endDate 사이에 포함되는지 여부
const isDateInRange = (date, startDate, endDate) => {
  return date >= startDate && date <= endDate;
};

// 할 일(투두) 관리 메인 컴포넌트
function TodoManager({ subtask, onUpdateSubtask }) {
  // Firebase Timestamp를 Date로 변환하는 헬퍼 함수
  const convertToDate = (dateValue) => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    } else if (typeof dateValue === 'string') {
      return new Date(dateValue);
    } else if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    } else {
      return new Date();
    }
  };

  const startDate = subtask ? new Date(subtask.startDate) : null;
  const endDate = subtask ? new Date(subtask.endDate) : null;
  const availableWeeks = subtask ? getWeeksInRange(startDate, endDate) : [];
  
  const [selectedWeek, setSelectedWeek] = useState(availableWeeks[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState(() => {
    if (!subtask?.todos) return {};
    const todosByDate = {};
    subtask.todos.forEach(todo => {
      const dateKey = todo.date;
      if (!todosByDate[dateKey]) {
        todosByDate[dateKey] = [];
      }
      todosByDate[dateKey].push(todo);
    });
    return todosByDate;
  });
  const [newTodo, setNewTodo] = useState('');

  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    setSelectedDate(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const addTodo = () => {
    if (!newTodo.trim() || !selectedDate) return;
    const dateKey = `${selectedDate}`;
    const newTodoItem = {
      id: Date.now(),
      text: newTodo,
      progress: 0,
      date: dateKey
    };

    const updatedTodos = {
      ...todos,
      [dateKey]: [...(todos[dateKey] || []), newTodoItem]
    };

    setTodos(updatedTodos);

    if (onUpdateSubtask) {
      const allTodos = Object.values(updatedTodos).flat();
      const updatedSubtask = {
        ...subtask,
        todos: allTodos,
        deadline: convertToDate(subtask.deadline),
        startDate: subtask.startDate,
        endDate: subtask.endDate
      };
      onUpdateSubtask(updatedSubtask);
    }

    setNewTodo('');
  };

  const updateTodoProgress = (dateKey, todoId, newProgress) => {
    const updatedTodos = {
      ...todos,
      [dateKey]: todos[dateKey].map(todo =>
        todo.id === todoId ? { ...todo, progress: newProgress } : todo
      )
    };

    setTodos(updatedTodos);

    if (onUpdateSubtask) {
      const allTodos = Object.values(updatedTodos).flat();
      const updatedSubtask = {
        ...subtask,
        todos: allTodos,
        deadline: convertToDate(subtask.deadline),
        startDate: subtask.startDate,
        endDate: subtask.endDate
      };
      onUpdateSubtask(updatedSubtask);
    }
  };

  const deleteTodo = (dateKey, todoId) => {
    const updatedTodos = {
      ...todos,
      [dateKey]: todos[dateKey].filter(todo => todo.id !== todoId)
    };

    setTodos(updatedTodos);

    if (onUpdateSubtask) {
      const allTodos = Object.values(updatedTodos).flat();
      const updatedSubtask = {
        ...subtask,
        todos: allTodos,
        deadline: convertToDate(subtask.deadline),
        startDate: subtask.startDate,
        endDate: subtask.endDate
      };
      onUpdateSubtask(updatedSubtask);
    }
  };

  const getWeekDays = () => {
    if (!selectedWeek) return [];
    const weekMatch = selectedWeek.match(/(\d+)월 (\d+)주차/);
    if (!weekMatch) return [];
    const month = parseInt(weekMatch[1]);
    const weekNum = parseInt(weekMatch[2]);
    const year = startDate.getFullYear();
    return getDaysInWeek(year, month, weekNum);
  };

  const isDateActive = (day) => {
    const currentMonth = selectedWeek?.match(/(\d+)월/)?.[1];
    if (!currentMonth) return false;
    const checkDate = new Date(startDate.getFullYear(), parseInt(currentMonth) - 1, day);
    return isDateInRange(checkDate, startDate, endDate);
  };

  const hasDateTodos = (day) => {
    return todos[day] && todos[day].length > 0;
  };

  const currentTodos = selectedDate ? todos[selectedDate] || [] : [];

  return (
    <div className="todo-bar">
      <style>{styles}</style>
      <div className="todo-container">
        {!subtask ? (
          // 1. 초기 상태 - 세부 프로젝트 선택 안내
          <div className="placeholder">
            <svg className="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
            <div className="placeholder-text">세부 프로젝트를 선택해주세요</div>
            <div className="placeholder-subtext">
              마인드맵에서 프로젝트를 클릭하면<br/>
              해당 프로젝트의 할 일을 관리할 수 있습니다
            </div>
          </div>
        ) : (
          // 2. 프로젝트 선택됨 - TodoManager 표시
          <>
            <div className="todo-header">
              <div className="todo-title">{subtask.title}</div>
              <div className="todo-subtitle">
                {subtask.startDate} ~ {subtask.endDate}
              </div>
            </div>

            <div className="calendar-header">
              <button 
                className="nav-btn"
                onClick={() => {
                  const currentIndex = availableWeeks.findIndex(week => week === selectedWeek);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableWeeks.length - 1;
                  handleWeekSelect(availableWeeks[prevIndex]);
                }}
              >
                ‹
              </button>
              <div className="month-year">
                {selectedWeek || availableWeeks[0]}
              </div>
              <button 
                className="nav-btn"
                onClick={() => {
                  const currentIndex = availableWeeks.findIndex(week => week === selectedWeek);
                  const nextIndex = currentIndex < availableWeeks.length - 1 ? currentIndex + 1 : 0;
                  handleWeekSelect(availableWeeks[nextIndex]);
                }}
              >
                ›
              </button>
            </div>

            {/* 날짜 선택 */}
            <div className="calendar-days">
              <div>
                {getWeekDays().map(day => (
                  <div
                    key={day}
                    onClick={() => isDateActive(day) ? handleDateSelect(day) : null}
                    className={`day ${selectedDate === day ? 'today' : ''} ${!isDateActive(day) ? 'disabled' : ''} ${hasDateTodos(day) ? 'has-todos' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* 할 일 입력 */}
            {selectedDate && (
              <>
                <div className="task-input">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="할 일을 입력하세요"
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <button 
                    className="add-task-btn"
                    onClick={addTodo}
                  >
                    <svg width="20" height="20" viewBox="0 0 29 29" fill="white">
                      <path d="M14.5 0v29M0 14.5h29" stroke="white" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>

                {/* 할 일 목록 */}
                <div className="task-list">
                  <h3>
                    {selectedWeek} {selectedDate}일 할 일
                  </h3>
                  
                  {currentTodos.length === 0 ? (
                    <p className="empty-state">
                      등록된 할 일이 없습니다.
                    </p>
                  ) : (
                    currentTodos.map(todo => (
                      <div 
                        key={todo.id} 
                        className={`task-item ${todo.progress === 100 ? 'completed' : ''}`}
                      >
                        <div 
                          className="progress-bar"
                          onMouseDown={(e) => {
                            const progressBar = e.currentTarget;
                            const rect = progressBar.getBoundingClientRect();
                            const handleMouseMove = (moveEvent) => {
                              const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                              const percentage = Math.round((x / rect.width) * 100);
                              updateTodoProgress(selectedDate.toString(), todo.id, percentage);
                            };
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                            handleMouseMove(e);
                          }}
                        >
                          <div 
                            className={`progress ${todo.progress === 100 ? 'completed' : ''}`}
                            style={{ width: `${todo.progress}%` }}
                          />
                          <span className="progress-text">
                            {todo.progress}%
                          </span>
                          <div 
                            className={`progress-handle ${todo.progress === 100 ? 'completed' : ''}`}
                            style={{ left: `${Math.max(0, Math.min(todo.progress - 1, 99))}%` }}
                          />
                        </div>
                        
                        <span className={`task-title ${todo.progress === 100 ? 'completed' : ''}`}>
                          {todo.text}
                        </span>
                        
                        <button 
                          className="task-options"
                          onClick={() => deleteTodo(selectedDate.toString(), todo.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* 날짜 선택 안내 */}
            {!selectedDate && (
              <div className="date-selection-guide">
                <h4>날짜를 선택해주세요</h4>
                <p>
                  위에서 날짜를 선택하면<br/>
                  해당 날짜의 할 일을 관리할 수 있습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TodoManager;