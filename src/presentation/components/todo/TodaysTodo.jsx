import TodoBox from "./TodoBox";
import "./TodaysTodo.css";
import { useState, useEffect } from "react";
import { updateSubtaskTodo, deleteSubtaskTodo } from "../../../services/projects";
import { calculateTodoReward, calculateSubtaskReward } from "../../../utils/jellyRewardCalculator";

function TodaysTodo({ todos, onUpdateTodos, currentDate, projects = [], onJellyReward }) {
  const currentDateKey = currentDate;
  console.log(todos);
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

  const [todosState, setTodosState] = useState(todos || []);
  const [wasSubtaskComplete, setWasSubtaskComplete] = useState(new Map()); // subtask별 완료 상태 추적

  // todos prop이 변경될 때마다 todosState 업데이트
  useEffect(() => {
    setTodosState(todos || []);
  }, [todos]);

  // 마감일(deadline)이 오늘인 투두만 필터링
  const todayTodos = todosState.filter(todo => {
    // deadline이 있으면 deadline 기준, 없으면 date(생성일) 기준
    const deadlineDate = todo.deadline || todo.date;
    return deadlineDate === currentDateKey;
  });
  
  console.log(`currentDateKey:`, currentDateKey);
  console.log(`todos:`, todos);
  console.log(`todosState:`, todosState);
  console.log(`todayTodos (마감일이 오늘인 투두):`, todayTodos);
  const completedCount = todayTodos.filter(todo => todo.progress === 100).length;

  const handleUpdateTodos = (updatedTodos) => {
    setTodosState(updatedTodos);
    if (onUpdateTodos) {
      onUpdateTodos(updatedTodos);
    }
  };

  // 투두 수정 핸들러 (Firebase에 저장)
  const handleEditText = async (todoId, newText) => {
    const todo = todayTodos.find(t => t.id === todoId);
    if (!todo || !todo.projectId || !todo.subtaskId) return;

    const dateKey = todo.date;
    
    try {
      await updateSubtaskTodo(todo.projectId, todo.subtaskId, dateKey, String(todoId), {
        text: newText
      });
      // Firebase 구독으로 자동 업데이트됨
    } catch (error) {
      console.error("할 일 수정 중 오류:", error);
    }
  };

  // 투두 진행도 업데이트 핸들러 (Firebase에 저장)
  const handleUpdateProgress = async (todoId, newProgress) => {
    const todo = todayTodos.find(t => t.id === todoId);
    if (!todo || !todo.projectId || !todo.subtaskId) return;

    const dateKey = todo.date;
    const oldTodo = todayTodos.find(t => t.id === todoId);
    
    try {
      await updateSubtaskTodo(todo.projectId, todo.subtaskId, dateKey, String(todoId), {
        progress: newProgress,
        completed: newProgress === 100
      });
      // Firebase 구독으로 자동 업데이트됨

      // 투두가 완료되었을 때 젤리 보상 계산
      if (oldTodo && newProgress === 100 && oldTodo.progress !== 100) {
        // 프로젝트와 subtask 정보 찾기
        const project = projects.find(p => p.id === todo.projectId);
        const subtask = project?.subtasks?.find(s => s.id === todo.subtaskId);
        
        if (project && subtask) {
          // 같은 subtask의 모든 투두 가져오기 (Firebase에서 받은 todos에서)
          const subtaskTodos = todosState.filter(t => 
            t.projectId === todo.projectId && t.subtaskId === todo.subtaskId
          );
          
          // 투두 완료 보상 계산
          const todoRewards = calculateTodoReward(todo, subtaskTodos, subtask, new Date());
          let allRewards = [...todoRewards];

          // 세부프로젝트가 완료되었는지 확인
          const subtaskKey = `${todo.projectId}-${todo.subtaskId}`;
          const subtaskProgressComplete = subtask.progress === 100;
          
          if (subtaskProgressComplete && !wasSubtaskComplete.has(subtaskKey)) {
            // 세부프로젝트 완료 보상 계산
            const subtaskRewards = calculateSubtaskReward(subtask, project.subtasks || [], project, new Date());
            allRewards = [...allRewards, ...subtaskRewards];
            setWasSubtaskComplete(prev => new Map(prev).set(subtaskKey, true));
          }

          // 젤리 보상 콜백 호출
          if (allRewards.length > 0 && onJellyReward) {
            onJellyReward(allRewards, todoId);
          }
        }
      }
    } catch (error) {
      console.error("할 일 진행도 업데이트 중 오류:", error);
    }
  };

  // 투두 삭제 핸들러 (Firebase에서 제거)
  const handleDeleteTodo = async (todoId) => {
    const todo = todayTodos.find(t => t.id === todoId);
    if (!todo || !todo.projectId || !todo.subtaskId) return;

    const dateKey = todo.date;
    
    try {
      await deleteSubtaskTodo(todo.projectId, todo.subtaskId, dateKey, String(todoId));
      // Firebase 구독으로 자동 업데이트됨
    } catch (error) {
      console.error("할 일 삭제 중 오류:", error);
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

      <TodoBox 
        todos={todayTodos} 
        onUpdateTodos={handleUpdateTodos} 
        mode="today"
        onEditText={handleEditText}
        onUpdateProgress={handleUpdateProgress}
        onDeleteTodo={handleDeleteTodo}
      />
    </div>
  );
}

export default TodaysTodo;
