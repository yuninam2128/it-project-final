import { useState, useEffect } from "react";
import TodoBox from "./TodoBox";
import "./SubtaskTodoList.css";

function SubtaskTodoList({ subtask, onUpdateSubtask }) {
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0~11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // 0~4 (주차 인덱스)

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // 주어진 year, month의 총 주 개수 계산 (1~5)
  const getWeekCountOfMonth = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Math.ceil(lastDay / 7);
  };

  // 주어진 year, month, weekIndex로 그 주의 날짜 배열 반환
  // weekIndex: 0~4 (각 주의 첫 날: 1, 8, 15, 22, 29)
  const getWeekDays = (year, month, weekIndex) => {
    const startDay = 1 + 7 * weekIndex; // 주의 시작일
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = startDay + i;
      if (day <= lastDayOfMonth) {
        const date = new Date(year, month, day);
        days.push(date);
      }
    }

    return days;
  };

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
        // 배열 형태 (createdAt 기준으로 처리)
        allTodos.push(...subtask.todos);
      }
      setTodos(allTodos);
    }
  }, [subtask]);

  // 초기 선택 날짜를 subtask의 startDate로 설정
  useEffect(() => {
    if (subtask && subtask.startDate) {
      const startDate = new Date(subtask.startDate);
      setSelectedDate(startDate);
      setCurrentYear(startDate.getFullYear());
      setCurrentMonth(startDate.getMonth());

      // 시작 날짜의 주차 계산
      const startDay = startDate.getDate();
      const weekIndex = Math.floor((startDay - 1) / 7);
      setCurrentWeekIndex(weekIndex);
    }
  }, [subtask]);

  // 날짜가 활성화 가능한 범위 내인지 확인
  const isDateInRange = (date) => {
    if (!subtask || !subtask.startDate || !subtask.endDate) {
      return true;
    }
    const startDate = new Date(subtask.startDate);
    const endDate = new Date(subtask.endDate);
    return date >= startDate && date <= endDate;
  };

  // 주간 이동 가능 여부 확인
  const canChangeWeek = (direction) => {
    if (!subtask || !subtask.startDate || !subtask.endDate) {
      return true;
    }

    // 다음 주로 이동하는 경우
    if (direction > 0) {
      let nextYear = currentYear;
      let nextMonth = currentMonth;
      let nextWeekIndex = currentWeekIndex + 1;

      // 다음 달로 넘어가는 경우
      if (nextWeekIndex >= getWeekCountOfMonth(nextYear, nextMonth)) {
        nextMonth += 1;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        nextWeekIndex = 0;
      }

      const nextWeekDays = getWeekDays(nextYear, nextMonth, nextWeekIndex);
      // 다음 주에 활성화 가능한 날짜가 하나 이상 있는지 확인
      return nextWeekDays.some(date => isDateInRange(date));
    }

    // 이전 주로 이동하는 경우
    if (direction < 0) {
      let prevYear = currentYear;
      let prevMonth = currentMonth;
      let prevWeekIndex = currentWeekIndex - 1;

      // 이전 달로 넘어가는 경우
      if (prevWeekIndex < 0) {
        prevMonth -= 1;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear -= 1;
        }
        prevWeekIndex = getWeekCountOfMonth(prevYear, prevMonth) - 1;
      }

      const prevWeekDays = getWeekDays(prevYear, prevMonth, prevWeekIndex);
      // 이전 주에 활성화 가능한 날짜가 하나 이상 있는지 확인
      return prevWeekDays.some(date => isDateInRange(date));
    }

    return true;
  };

  // 주간 선택 변경
  const handleWeekChange = (direction) => {
    // 이동 가능 여부 확인
    if (!canChangeWeek(direction)) {
      return;
    }

    let newYear = currentYear;
    let newMonth = currentMonth;
    let newWeekIndex = currentWeekIndex + direction;

    // 다음 달로 넘어가는 경우
    if (newWeekIndex >= getWeekCountOfMonth(newYear, newMonth)) {
      newMonth += 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      newWeekIndex = 0;
    }

    // 이전 달로 넘어가는 경우
    if (newWeekIndex < 0) {
      newMonth -= 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      newWeekIndex = getWeekCountOfMonth(newYear, newMonth) - 1;
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setCurrentWeekIndex(newWeekIndex);
  };

  const handleUpdateTodos = (updatedTodos) => {
    setTodos(updatedTodos);

    if (subtask && onUpdateSubtask) {
      // 날짜별로 그룹화하여 todos 객체 생성
      const todosMap = {};
      updatedTodos.forEach(todo => {
        const dateKey = formatDate(todo.createdAt);
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

  // 날짜 선택 (범위 내일 때만 가능)
  const handleDateSelect = (date) => {
    if (isDateInRange(date)) {
      setSelectedDate(date);
    }
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

  const weekDays = getWeekDays(currentYear, currentMonth, currentWeekIndex);
  const displayMonth = currentMonth + 1;
  const displayWeekNumber = currentWeekIndex + 1;

  // 프로젝트 시작일과 종료일 (subtitle용)
  const startDateStr = subtask.startDate ? new Date(subtask.startDate).toLocaleDateString('ko-KR') : '';
  const endDateStr = subtask.endDate ? new Date(subtask.endDate).toLocaleDateString('ko-KR') : '';

  return (
    <div className="subtask-todo-list">
      {/* 1. detail-todo-title 섹션 */}
      <div className="detail-todo-title">
        <h2 className="detail-todo-title-text">{subtask.title}</h2>
        {startDateStr && endDateStr && (
          <p className="detail-todo-title-date">{startDateStr}~{endDateStr}</p>
        )}
      </div>

      {/* 2. 구분선 (Lin4) */}
      <div className="divider-line"></div>

      {/* 3. week-select 섹션 - 주간 선택 컨트롤 */}
      <div className="week-select">
        <button
          className="week-select-arrow"
          onClick={() => handleWeekChange(-1)}
          aria-label="이전 주"
          disabled={!canChangeWeek(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="week-select-label">{displayMonth.toString().padStart(2, '0')}.{displayWeekNumber.toString().padStart(2, '0')} 주</span>
        <button
          className="week-select-arrow"
          onClick={() => handleWeekChange(1)}
          aria-label="다음 주"
          disabled={!canChangeWeek(1)}
        >
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

          // createdAt 기준으로 해당 날짜의 todos 필터링
          const todosForDay = todos.filter(todo => {
            if (!todo.createdAt) return false;
            return formatDate(todo.createdAt) === dateStr;
          });

          const hasTodos = todosForDay.length > 0;
          const isSelected = formatDate(selectedDate) === dateStr;
          const isInRange = isDateInRange(date);

          const dayClass = !isInRange
            ? 'day-disabled'
            : isSelected
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
              tabIndex={isInRange ? "0" : "-1"}
              aria-disabled={!isInRange}
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
