import { useState, useEffect } from "react";
import TodoBox from "./TodoBox";
import "./SubtaskTodoList.css";

function SubtaskTodoList({ subtask, onUpdateSubtask }) {
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // subtask의 todos를 초기화
  useEffect(() => {
    if (subtask && subtask.todos) {
      const allTodos = [];
      if (typeof subtask.todos === 'object' && !Array.isArray(subtask.todos)) {
        // 객체 형태: { "2024-01-01": [todos], ... }
        Object.entries(subtask.todos).forEach(([dateKey, todosArray]) => {
          if (Array.isArray(todosArray)) {
            todosArray.forEach(todo => {
              allTodos.push({
                ...todo,
                date: dateKey
              });
            });
          }
        });
      } else if (Array.isArray(subtask.todos)) {
        // 배열 형태 (기존)
        allTodos.push(...subtask.todos);
      }
      setTodos(allTodos);
    }
  }, [subtask]);

  const handleUpdateTodos = (updatedTodos) => {
    setTodos(updatedTodos);

    if (subtask && onUpdateSubtask) {
      // 날짜별로 그룹화하여 todos 객체 생성
      const todosMap = {};
      updatedTodos.forEach(todo => {
        const dateKey = todo.date;
        if (!todosMap[dateKey]) {
          todosMap[dateKey] = [];
        }
        const { date, ...todoData } = todo;
        todosMap[dateKey].push(todoData);
      });

      // 부모 컴포넌트에 업데이트 전달
      const updatedSubtask = {
        ...subtask,
        todos: todosMap
      };
      onUpdateSubtask(updatedSubtask);
    }
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // 표시할 주간 날짜들 (7일)
  const getWeekDays = (weekStart) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // 주간 선택 변경
  const handleWeekChange = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newWeekStart);
  };

  // 날짜 선택
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  if (!subtask) {
    return (
      <div className="subtask-todo-list">
        <div className="empty-placeholder">
          <p>세부 프로젝트를 선택하여 할 일을 관리하세요</p>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays(currentWeekStart);
  const weekMonth = currentWeekStart.getMonth() + 1;
  const weekNumber = Math.ceil(currentWeekStart.getDate() / 7);

  // 프로젝트 시작일과 종료일 (subtitle용)
  const startDateStr = subtask.startDate ? new Date(subtask.startDate).toLocaleDateString('ko-KR') : '';
  const endDateStr = subtask.endDate ? new Date(subtask.endDate).toLocaleDateString('ko-KR') : '';

  return (
    <div className="subtask-todo-list">
      {/* 1. detail-todo-title 섹션 */}
      <div className="detail-todo-title">
        <h2 className="detail-todo-title-text">{subtask.name}</h2>
        {startDateStr && endDateStr && (
          <p className="detail-todo-title-date">{startDateStr}~{endDateStr}</p>
        )}
      </div>

      {/* 2. 구분선 (Lin4) */}
      <div className="divider-line"></div>

      {/* 3. week-select 섹션 - 주간 선택 컨트롤 */}
      <div className="week-select">
        <button className="week-select-arrow" onClick={() => handleWeekChange(-1)} aria-label="이전 주">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="week-select-label">{weekMonth.toString().padStart(2, '0')}.{String(weekNumber).padStart(2, '0')} 주</span>
        <button className="week-select-arrow" onClick={() => handleWeekChange(1)} aria-label="다음 주">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 4. week 섹션 - 날짜 선택 */}
      <div className="week-display">
        {weekDays.map((date) => {
          const dateStr = formatDate(date);
          const dayNum = date.getDate();
          const todosForDay = todos.filter(todo => todo.date === dateStr);
          const hasTodos = todosForDay.length > 0;
          const isSelected = formatDate(selectedDate) === dateStr;
          const dayClass = isSelected
            ? 'day-selected'
            : hasTodos
              ? 'day-with-todo'
              : 'day';

          return (
            <div
              key={dateStr}
              className={`day ${dayClass}`}
              onClick={() => handleDateSelect(date)}
              role="button"
              tabIndex="0"
            >
              <span className="day-number">{dayNum}</span>
              {hasTodos && <div className="day-indicator"></div>}
            </div>
          );
        })}
      </div>

      {/* 5. content 섹션 - 투두 입력박스 + 투두리스트 */}
      <div className="detail-todo-content">
        <TodoBox
          todos={todos}
          onUpdateTodos={handleUpdateTodos}
          showAddInput={true}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}

export default SubtaskTodoList;
