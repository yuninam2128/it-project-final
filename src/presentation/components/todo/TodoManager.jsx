import React, { useState, useEffect } from "react";
import { 
  subscribeToSubtaskTodos,
  addSubtaskTodo,
  updateSubtaskTodo,
  deleteSubtaskTodo
} from '../../../services/projects';

// 유틸리티 함수들
const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const adjustedDate = date.getDate() + firstDayWeekday - 1;
  return Math.ceil(adjustedDate / 7);
};

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

const isDateInRange = (date, startDate, endDate) => {
  return date >= startDate && date <= endDate;
};

function TodoManager({ subtask, onBack, projectId }) {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState({});
  const [newTodo, setNewTodo] = useState('');

  const startDate = new Date(subtask.startDate);
  const endDate = new Date(subtask.endDate);
  const availableWeeks = getWeeksInRange(startDate, endDate);

  // 파이어베이스에서 할일 데이터 실시간 구독
  useEffect(() => {
    if (!projectId || !subtask.id) return;
    const unsubscribe = subscribeToSubtaskTodos(projectId, subtask.id, (todosData) => {
      setTodos(todosData);
    });
    return () => unsubscribe && unsubscribe();
  }, [projectId, subtask.id]);

  // 컴포넌트가 다시 마운트될 때 마지막 선택된 주차와 날짜 복원
  useEffect(() => {
    if (!selectedWeek && projectId && subtask.id) {
      const storageKey = `todo_selection_${projectId}_${subtask.id}`;
      const savedSelection = localStorage.getItem(storageKey);
      
      if (savedSelection) {
        try {
          const { week, date } = JSON.parse(savedSelection);
          setSelectedWeek(week);
          setSelectedDate(date);
        } catch (error) {
          console.error('저장된 선택 정보 복원 중 오류:', error);
        }
      } else if (Object.keys(todos).length > 0) {
        // 저장된 선택이 없으면 가장 최근에 할일이 있는 날짜를 찾아서 선택
        const dateKeys = Object.keys(todos).sort((a, b) => parseInt(b) - parseInt(a));
        if (dateKeys.length > 0) {
          const lastDate = parseInt(dateKeys[0]);
          const startDate = new Date(subtask.startDate);
          const endDate = new Date(subtask.endDate);
          
          // 해당 날짜가 속한 주차 찾기
          const checkDate = new Date(startDate.getFullYear(), startDate.getMonth(), lastDate);
          if (checkDate >= startDate && checkDate <= endDate) {
            const weekNumber = getWeekNumber(checkDate);
            const monthName = checkDate.toLocaleDateString('ko-KR', { month: 'long' });
            const weekString = `${monthName} ${weekNumber}주차`;
            
            setSelectedWeek(weekString);
            setSelectedDate(lastDate);
          }
        }
      }
    }
  }, [todos, selectedWeek, projectId, subtask.id, subtask.startDate, subtask.endDate]);

  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    setSelectedDate(null);
    
    // localStorage에 저장
    if (projectId && subtask.id) {
      const storageKey = `todo_selection_${projectId}_${subtask.id}`;
      localStorage.setItem(storageKey, JSON.stringify({ week, date: null }));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // localStorage에 저장
    if (projectId && subtask.id && selectedWeek) {
      const storageKey = `todo_selection_${projectId}_${subtask.id}`;
      localStorage.setItem(storageKey, JSON.stringify({ week: selectedWeek, date }));
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !selectedDate || !projectId || !subtask.id) return;
    
    const dateKey = `${selectedDate}`;
    const todo = { text: newTodo, completed: false };
    
    // 낙관적 업데이트
    setTodos(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now().toString(), ...todo }]
    }));
    setNewTodo('');
    
    // 파이어베이스에 저장
    try {
      await addSubtaskTodo(projectId, subtask.id, dateKey, todo);
    } catch (error) {
      console.error('할일 추가 중 오류:', error);
    }
  };

  const toggleTodo = async (dateKey, todoId) => {
    if (!projectId || !subtask.id) return;
    
    const todo = todos[dateKey]?.find(t => t.id === todoId);
    if (!todo) return;
    
    // 낙관적 업데이트
    setTodos(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(t => 
        t.id === todoId ? { ...t, completed: !t.completed } : t
      )
    }));
    
    // 파이어베이스에 저장
    try {
      await updateSubtaskTodo(projectId, subtask.id, dateKey, todoId, { completed: !todo.completed });
    } catch (error) {
      console.error('할일 상태 변경 중 오류:', error);
    }
  };

  const deleteTodo = async (dateKey, todoId) => {
    if (!projectId || !subtask.id) return;
    
    // 낙관적 업데이트
    setTodos(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(todo => todo.id !== todoId)
    }));
    
    // 파이어베이스에서 삭제
    try {
      await deleteSubtaskTodo(projectId, subtask.id, dateKey, todoId);
    } catch (error) {
      console.error('할일 삭제 중 오류:', error);
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

  const hasTodosForDate = (day) => {
    const dateKey = `${day}`;
    return todos[dateKey] && todos[dateKey].length > 0;
  };

  const getCompletedTodosCount = (day) => {
    const dateKey = `${day}`;
    if (!todos[dateKey]) return 0;
    return todos[dateKey].filter(todo => todo.completed).length;
  };

  const getTotalTodosCount = (day) => {
    const dateKey = `${day}`;
    return todos[dateKey] ? todos[dateKey].length : 0;
  };

  const getWeekTodosInfo = (week) => {
    const weekMatch = week.match(/(\d+)월 (\d+)주차/);
    if (!weekMatch) return { hasTodos: false, totalCount: 0, completedCount: 0 };
    
    const month = parseInt(weekMatch[1]);
    const weekNum = parseInt(weekMatch[2]);
    const year = startDate.getFullYear();
    const weekDays = getDaysInWeek(year, month, weekNum);
    
    let totalCount = 0;
    let completedCount = 0;
    let hasTodos = false;
    
    weekDays.forEach(day => {
      const dateKey = `${day}`;
      if (todos[dateKey]) {
        hasTodos = true;
        totalCount += todos[dateKey].length;
        completedCount += todos[dateKey].filter(todo => todo.completed).length;
      }
    });
    
    return { hasTodos, totalCount, completedCount };
  };

  const currentTodos = selectedDate ? todos[selectedDate] || [] : [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '15px'
          }}
        >
          ← 뒤로가기
        </button>
        <h2 style={{ display: 'inline', margin: 0 }}>
          {subtask.title} 할 일 관리
        </h2>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <p><strong>기간:</strong> {subtask.startDate} ~ {subtask.endDate}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* 왼쪽: 주차 및 날짜 선택 */}
        <div>
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '15px' }}>주차 선택</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {availableWeeks.map(week => {
                const weekInfo = getWeekTodosInfo(week);
                const isAllCompleted = weekInfo.hasTodos && weekInfo.completedCount === weekInfo.totalCount;
                
                return (
                  <button
                    key={week}
                    onClick={() => handleWeekSelect(week)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: selectedWeek === week ? '#007bff' : 
                                     isAllCompleted ? '#d4edda' :
                                     weekInfo.hasTodos ? '#fff3cd' : '#e9ecef',
                      color: selectedWeek === week ? 'white' : '#495057',
                      border: selectedWeek === week ? 'none' : 
                             weekInfo.hasTodos ? '2px solid #ffc107' : '1px solid #ced4da',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {week}
                    {weekInfo.hasTodos && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: isAllCompleted ? '#28a745' : '#ffc107',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {weekInfo.completedCount}/{weekInfo.totalCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedWeek && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>{selectedWeek} 날짜 선택</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {getWeekDays().map(day => {
                  const hasTodos = hasTodosForDate(day);
                  const completedCount = getCompletedTodosCount(day);
                  const totalCount = getTotalTodosCount(day);
                  const isAllCompleted = hasTodos && completedCount === totalCount;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => isDateActive(day) ? handleDateSelect(day) : null}
                      disabled={!isDateActive(day)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: selectedDate === day ? '#28a745' : 
                                       isAllCompleted ? '#d4edda' :
                                       hasTodos ? '#fff3cd' : 
                                       isDateActive(day) ? '#e9ecef' : '#f8f9fa',
                        color: selectedDate === day ? 'white' : 
                               isDateActive(day) ? '#495057' : '#6c757d',
                        border: selectedDate === day ? 'none' : 
                               hasTodos ? '2px solid #ffc107' : '1px solid #ced4da',
                        borderRadius: '5px',
                        cursor: isDateActive(day) ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      {day}일
                      {hasTodos && (
                        <span style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          backgroundColor: isAllCompleted ? '#28a745' : '#ffc107',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {completedCount}/{totalCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 할 일 관리 */}
        <div>
          {selectedDate ? (
            <>
              <h3 style={{ marginBottom: '15px' }}>
                {selectedWeek} {selectedDate}일 할 일
              </h3>
              
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="새로운 할 일을 입력하세요"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ced4da',
                    borderRadius: '5px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <button 
                  onClick={addTodo}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  추가
                </button>
              </div>

              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '15px',
                background: 'white'
              }}>
                {currentTodos.length === 0 ? (
                  <p style={{ color: '#6c757d', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>
                    등록된 할 일이 없습니다.
                  </p>
                ) : (
                  currentTodos.map(todo => (
                    <div 
                      key={todo.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        margin: '8px 0',
                        background: todo.completed ? '#f8f9fa' : 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '5px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(selectedDate.toString(), todo.id)}
                        style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                      />
                      <span 
                        style={{
                          flex: 1,
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#6c757d' : '#212529',
                          fontSize: '16px'
                        }}
                      >
                        {todo.text}
                      </span>
                      <button 
                        onClick={() => deleteTodo(selectedDate.toString(), todo.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#6c757d',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <h4 style={{ marginBottom: '10px' }}>날짜를 선택해주세요</h4>
              <p>왼쪽에서 주차와 날짜를 선택하면<br/>해당 날짜의 할 일을 관리할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoManager;