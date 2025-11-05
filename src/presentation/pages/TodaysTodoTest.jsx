import React, { useState, useEffect } from "react";
import TodaysTodo from "../components/todo/TodaysTodo";
import SubtaskTodoList from "../components/todo/SubtaskTodoList";
import "./TodaysTodoTest.css";

function TodaysTodoTest() {
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  // 로컬 스토리지에서 todos 로드
  useEffect(() => {
    const savedTodos = localStorage.getItem('testTodos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      // 기본 샘플 데이터
      const today = new Date().toISOString().split('T')[0];
      setTodos([
        {
          id: 1,
          text: 'ProjectTimeline 컴포넌트 스타일 수정',
          progress: 65,
          date: today,
          completed: false
        },
        {
          id: 2,
          text: 'TodaysTodo 컴포넌트 구현',
          progress: 100,
          date: today,
          completed: true
        },
        {
          id: 3,
          text: '테스트 페이지 작성',
          progress: 45,
          date: today,
          completed: false
        },
        {
          id: 4,
          text: 'Figma 디자인 검토',
          progress: 20,
          date: today,
          completed: false
        }
      ]);
    }

    // 샘플 subtask 데이터 초기화
    const savedSubtask = localStorage.getItem('testSubtask');
    if (!savedSubtask) {
      const today = new Date().toISOString().split('T')[0];
      const sampleSubtask = {
        id: 'subtask_1',
        name: '투두리스트 UI 구현',
        priority: '상',
        progress: 50,
        deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        todos: {
          [today]: [
            {
              id: 101,
              text: 'Figma 디자인 분석',
              progress: 100,
              completed: true
            },
            {
              id: 102,
              text: '컴포넌트 구조 설계',
              progress: 75,
              completed: false
            },
            {
              id: 103,
              text: 'CSS 스타일링',
              progress: 40,
              completed: false
            }
          ]
        }
      };
      localStorage.setItem('testSubtask', JSON.stringify(sampleSubtask));
      setSelectedSubtask(sampleSubtask);
    } else {
      setSelectedSubtask(JSON.parse(savedSubtask));
    }
  }, []);

  // todos 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('testTodos', JSON.stringify(todos));
  }, [todos]);

  const handleUpdateTodos = (updatedTodos) => {
    setTodos(updatedTodos);
  };

  const handleUpdateSubtask = (updatedSubtask) => {
    setSelectedSubtask(updatedSubtask);
    localStorage.setItem('testSubtask', JSON.stringify(updatedSubtask));
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleSubtaskChange = (e) => {
    const subtaskId = e.target.value;
    if (subtaskId === '') {
      setSelectedSubtask(null);
    } else {
      const savedSubtask = localStorage.getItem('testSubtask');
      if (savedSubtask) {
        setSelectedSubtask(JSON.parse(savedSubtask));
      }
    }
  };

  const addSampleSubtask = () => {
    const today = new Date().toISOString().split('T')[0];
    const newSubtask = {
      id: `subtask_${Date.now()}`,
      name: `새로운 세부프로젝트 ${Date.now()}`,
      priority: '중',
      progress: 0,
      deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      todos: {
        [today]: []
      }
    };
    // 현재는 새 subtask 추가 시 선택되는 것으로 처리
    setSelectedSubtask(newSubtask);
    localStorage.setItem('testSubtask', JSON.stringify(newSubtask));
  };

  const addSampleTodo = () => {
    const today = selectedDate.toISOString().split('T')[0];
    const newTodo = {
      id: Date.now(),
      text: '새로운 샘플 할 일',
      progress: 0,
      date: today,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const clearAllTodos = () => {
    if (window.confirm('모든 할 일을 삭제하시겠습니까?')) {
      setTodos([]);
    }
  };

  const resetSampleData = () => {
    const today = new Date().toISOString().split('T')[0];
    setTodos([
      {
        id: 1,
        text: 'ProjectTimeline 컴포넌트 스타일 수정',
        progress: 65,
        date: today,
        completed: false
      },
      {
        id: 2,
        text: 'TodaysTodo 컴포넌트 구현',
        progress: 100,
        date: today,
        completed: true
      },
      {
        id: 3,
        text: '테스트 페이지 작성',
        progress: 45,
        date: today,
        completed: false
      },
      {
        id: 4,
        text: 'Figma 디자인 검토',
        progress: 20,
        date: today,
        completed: false
      }
    ]);
  };

  return (
    <div className="todays-todo-test-container">
      <div className="test-header">
        <h1>TodaysTodo 컴포넌트 테스트</h1>
        <p>Figma 디자인 기반 투두리스트 컴포넌트 테스트 페이지</p>
      </div>

      <div className="test-controls">
        <div className="control-group">
          <label htmlFor="date-picker">날짜 선택:</label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
          />
        </div>

        <div className="control-group">
          <label htmlFor="subtask-selector">세부프로젝트 선택:</label>
          <select
            id="subtask-selector"
            value={selectedSubtask?.id || ''}
            onChange={handleSubtaskChange}
            className="subtask-select"
          >
            <option value="">세부프로젝트 선택</option>
            <option value="subtask_1">투두리스트 UI 구현 (샘플)</option>
          </select>
        </div>

        <div className="control-buttons">
          <button className="btn btn-primary" onClick={addSampleTodo}>
            + 할 일 추가 (오늘)
          </button>
          <button className="btn btn-primary" onClick={addSampleSubtask}>
            + 세부프로젝트 추가
          </button>
          <button className="btn btn-secondary" onClick={resetSampleData}>
            ↻ 샘플 데이터 초기화
          </button>
          <button className="btn btn-danger" onClick={clearAllTodos}>
            🗑️ 모두 삭제
          </button>
        </div>
      </div>

      <div className="test-content">
        <div className="component-wrapper">
          <h2 className="section-title">TodaysTodo 컴포넌트</h2>
          <TodaysTodo
            todos={todos}
            onUpdateTodos={handleUpdateTodos}
            date={selectedDate}
          />
        </div>

        <div className="component-wrapper">
          <h2 className="section-title">SubtaskTodoList 컴포넌트</h2>
          <SubtaskTodoList
            subtask={selectedSubtask}
            projectId="test-project"
            onUpdateSubtask={handleUpdateSubtask}
          />
        </div>

        <div className="debug-panel">
          <h3>디버그 정보</h3>
          <div className="debug-info">
            <p><strong>총 할 일:</strong> {todos.length}개</p>
            <p><strong>완료된 할 일:</strong> {todos.filter(t => t.progress === 100).length}개</p>
            <p><strong>진행 중인 할 일:</strong> {todos.filter(t => t.progress > 0 && t.progress < 100).length}개</p>
            <p><strong>미시작 할 일:</strong> {todos.filter(t => t.progress === 0).length}개</p>
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>데이터 구조</h3>
          <pre className="json-display">
            {JSON.stringify(todos, null, 2)}
          </pre>
        </div>
      </div>

      <div className="test-notes">
        <h3>테스트 가이드</h3>
        <ul>
          <li>입력 필드에서 엔터를 누르거나 + 버튼을 클릭하여 새로운 할 일을 추가합니다.</li>
          <li>진행률 바를 드래그하여 진행 상황을 업데이트합니다.</li>
          <li>완료 시 진행률이 100%가 되고 배지가 표시됩니다.</li>
          <li>마우스를 할 일 위에 올리면 삭제 버튼이 나타납니다.</li>
          <li>날짜를 변경하면 해당 날짜의 할 일만 표시됩니다.</li>
          <li>모든 변경 사항은 로컬 스토리지에 자동으로 저장됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

export default TodaysTodoTest;
