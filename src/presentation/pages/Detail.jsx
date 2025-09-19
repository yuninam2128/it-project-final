import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SubtaskMindmap from "../components/subtask/SubtaskMindmap";
import TodoManager from "../components/todo/TodoManager";
import "./Detail.css";
import { 
  subscribeToProject,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  updateSubtaskPosition
} from '../../services/projects';


function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [currentView, setCurrentView] = useState('mindmap'); // 'mindmap' | 'todo'
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [subtaskPositions, setSubtaskPositions] = useState({});

  // 프로젝트 데이터 실시간 구독
  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = subscribeToProject(projectId, (p) => {
      if (!p) return;
      setProject({
        ...p,
        deadline: p.deadline ? new Date(p.deadline.toDate ? p.deadline.toDate() : p.deadline) : new Date(),
      });
      // 서브태스크 위치
      const pos = p.subtaskPositions || {};
      setSubtaskPositions(pos);
    });
    return () => unsubscribe && unsubscribe();
  }, [projectId]);

  // 중요도에 따른 원 크기 반환
  const getRadius = (priority) => {
    if (priority === "상") return 75;
    if (priority === "중") return 55;
    return 40;
  };

  // 초기 subtask 위치 생성 함수는 더 이상 사용하지 않음 (실시간 데이터 사용)

  // Subtask 추가
  const handleAddSubtask = async (newSubtask) => {
    if (!project) return;
    const subtaskId = `subtask_${Date.now()}`;
    const subtaskWithId = {
      ...newSubtask,
      id: subtaskId,
      deadline: new Date(newSubtask.deadline),
      progress: Number(newSubtask.progress)
    };
    const newPosition = findAvailablePosition();
    // 낙관적 업데이트
    setProject(prev => ({ ...prev, subtasks: [...(prev?.subtasks || []), subtaskWithId] }));
    setSubtaskPositions(prev => ({ ...prev, [subtaskId]: newPosition }));
    // 파이어베이스 반영
    await addSubtask(project.id, subtaskWithId);
    await updateSubtaskPosition(project.id, subtaskId, newPosition);
  };

  // 사용 가능한 위치 찾기
  const findAvailablePosition = () => {
    const radius = getRadius("중"); // 기본 크기
    const padding = 20;
    const mapWidth = 800;
    const mapHeight = 500;
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
      const x = radius + Math.random() * (mapWidth - 2 * radius);
      const y = radius + Math.random() * (mapHeight - 2 * radius);

      // 기존 노드들과 겹치는지 확인
      const isOverlapping = Object.values(subtaskPositions).some(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < pos.radius + radius + padding;
      });

      if (!isOverlapping) {
        return { x, y, radius };
      }
    }

    // 위치를 찾지 못한 경우 랜덤 위치 반환
    return {
      x: radius + Math.random() * (mapWidth - 2 * radius),
      y: radius + Math.random() * (mapHeight - 2 * radius),
      radius
    };
  };

  // Subtask 수정
  const handleEditSubtask = async (updatedSubtask) => {
    if (!project) return;
    const normalized = {
      ...updatedSubtask,
      deadline: new Date(updatedSubtask.deadline),
      progress: Number(updatedSubtask.progress)
    };
    setProject(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask => subtask.id === normalized.id ? normalized : subtask)
    }));
    const newRadius = getRadius(updatedSubtask.priority);
    setSubtaskPositions(prev => ({
      ...prev,
      [updatedSubtask.id]: {
        ...prev[updatedSubtask.id],
        radius: newRadius
      }
    }));
    await updateSubtask(project.id, normalized);
  };

  // Subtask 삭제
  const handleDeleteSubtask = async (subtaskId) => {
    if (!project) return;
    setProject(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId)
    }));
    setSubtaskPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[subtaskId];
      return newPositions;
    });
    await deleteSubtask(project.id, subtaskId);
  };

  // Subtask 위치 변경
  const handleSubtaskPositionChange = async (subtaskId, x, y) => {
    const radius = subtaskPositions?.[subtaskId]?.radius || 55;
    const pos = { x, y, radius };
    setSubtaskPositions(prev => ({ ...prev, [subtaskId]: pos }));
    if (project) await updateSubtaskPosition(project.id, subtaskId, pos);
  };

  // Subtask 노드 클릭 (Todo 관리로 이동)
  const handleSubtaskClick = (subtask) => {
    setSelectedSubtask(subtask);
    setCurrentView('todo');
  };

  // 마인드맵으로 돌아가기
  const handleBackToMindmap = () => {
    setCurrentView('mindmap');
    setSelectedSubtask(null);
  };

  if (!project) {
    return (
      <div className="loading-container">
        <p>프로젝트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      {/* 헤더 */}
      <header className="project-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/home')}
        >
          ← 홈으로 돌아가기
        </button>
        <div className="project-info">
          <h1>{project.title}</h1>
          <div className="project-meta">
            <span className={`priority-badge ${project.priority}`}>
              중요도: {project.priority}
            </span>
            <span className="progress-badge">
              진행도: {project.progress}%
            </span>
            <span className="deadline-badge">
              마감일: {project.deadline.toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="project-detail-main">
        {currentView === 'mindmap' && (
          <SubtaskMindmap
            project={project}
            positions={subtaskPositions}
            onSubtaskClick={handleSubtaskClick}
            onAddSubtask={handleAddSubtask}
            onEditSubtask={handleEditSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onPositionChange={handleSubtaskPositionChange}
          />
        )}

        {currentView === 'todo' && selectedSubtask && (
          <TodoManager
            subtask={selectedSubtask}
            onBack={handleBackToMindmap}
            projectId={projectId}
          />
        )}
      </main>
    </div>
  );
}

export default ProjectDetail;