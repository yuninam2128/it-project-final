import React, { useState, useCallback, useEffect } from "react";
import SubtaskNode from "./SubtaskNode";
import SubtaskLine from "./SubtaskLine";
import SubtaskForm from "./SubtaskForm";
import "./SubtaskMindmap.css";

const CENTER_NODE_ID = "center";

function SubtaskMindmap({ 
  project, 
  positions, 
  onSubtaskClick, 
  onAddSubtask, 
  onEditSubtask, 
  onDeleteSubtask, 
  onPositionChange 
}) {
  const [showForm, setShowForm] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState(null);

  // 노드 데이터 생성
  const generateNodes = () => {
    const center = {
      id: CENTER_NODE_ID,
      label: project.title,
      x: 400,
      y: 250,
      isCenter: true,
      priority: project.priority,
      progress: project.progress
    };

    const subtaskNodes = project.subtasks.map(subtask => {
      const position = positions[subtask.id] || { x: 400, y: 250, radius: 55 };
      return {
        id: subtask.id,
        label: subtask.title,
        x: position.x,
        y: position.y,
        radius: position.radius,
        isCenter: false,
        priority: subtask.priority,
        progress: subtask.progress,
        data: subtask
      };
    });

    return [center, ...subtaskNodes];
  };

  // 연결선 데이터 생성
  const generateEdges = () => {
    return project.subtasks.map(subtask => ({
      id: `edge-${subtask.id}`,
      from: CENTER_NODE_ID,
      to: subtask.id
    }));
  };

  const nodes = generateNodes();
  const edges = generateEdges();

  // 노드 위치 가져오기 (맵 오프셋 적용)
  const getNodePosition = (node) => {
    if (node.isCenter) {
      return {
        x: node.x + mapOffset.x,
        y: node.y + mapOffset.y
      };
    }
    return {
      x: node.x + mapOffset.x,
      y: node.y + mapOffset.y
    };
  };

  // 노드 이동 처리
  const handleNodeMove = (nodeId, x, y) => {
    if (nodeId === CENTER_NODE_ID) return; // 중심 노드는 이동 불가
    
    // 맵 오프셋을 고려한 실제 위치 계산
    const actualX = x - mapOffset.x;
    const actualY = y - mapOffset.y;
    
    onPositionChange(nodeId, actualX, actualY);
  };

  // 노드 클릭 처리
  const handleNodeClick = (node) => {
    if (node.isCenter) return; // 중심 노드는 클릭 불가
    onSubtaskClick(node.data);
  };

  // 맵 드래그 처리
  const handleMapMouseDown = (e) => {
    if (e.target.closest('.subtask-node')) return;
    
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMapMouseMove = useCallback((e) => {
    if (!isDragging || !lastMousePos) return;

    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    setMapOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMapMouseUp = () => {
    setIsDragging(false);
    setLastMousePos(null);
  };

  // 전역 마우스 이벤트
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMapMouseMove);
      document.addEventListener('mouseup', handleMapMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMapMouseMove);
      document.removeEventListener('mouseup', handleMapMouseUp);
    };
  }, [isDragging, lastMousePos, handleMapMouseMove]);

  return (
    <div className="subtask-mindmap-container">
      {/* 툴바 */}
      <div className="subtask-toolbar">
        <button 
          className="add-subtask-btn"
          onClick={() => setShowForm(true)}
        >
          + 세부 작업 추가
        </button>
        <div className="mindmap-info">
          <span>총 {project.subtasks.length}개의 세부 작업</span>
          <span>완료율: {Math.round(project.subtasks.reduce((acc, st) => acc + st.progress, 0) / project.subtasks.length || 0)}%</span>
        </div>
      </div>

      {/* 마인드맵 캔버스 */}
      <div 
        className="subtask-mindmap-canvas"
        onMouseDown={handleMapMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto'
        }}
      >
        {/* 연결선 그리기 */}
        {edges.map(edge => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;
          
          const fromPos = getNodePosition(fromNode);
          const toPos = getNodePosition(toNode);
          
          return (
            <SubtaskLine
              key={edge.id}
              from={fromPos}
              to={toPos}
            />
          );
        })}

        {/* 노드 렌더링 */}
        {nodes.map(node => {
          const position = getNodePosition(node);
          return (
            <SubtaskNode
              key={node.id}
              node={{ ...node, ...position }}
              onMove={handleNodeMove}
              onClick={() => handleNodeClick(node)}
              onEdit={node.isCenter ? null : () => onEditSubtask(node.data)}
              onDelete={node.isCenter ? null : () => onDeleteSubtask(node.id)}
            />
          );
        })}
      </div>

      {/* 세부 작업 추가 폼 */}
      {showForm && (
        <SubtaskForm
          onSubmit={(newSubtask) => {
            onAddSubtask(newSubtask);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default SubtaskMindmap;