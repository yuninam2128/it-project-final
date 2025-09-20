import React, { useState } from "react";
import EditSubtaskForm from "./EditSubtaskForm";
import './SubtaskNode.css';

function SubtaskNode({ node, mapOffset, onMove, onClick, onEdit, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // 중요도에 따른 CSS 클래스 반환
  const getPriorityClass = (priority, isCenter) => {
    if (isCenter) {
      switch (priority) {
      case '상': return 'center-high';
      case '중': return 'center-medium';
      case '하': return 'center-low';
      default: return 'center-default';
    }
    }
    
    switch (priority) {
      case '상': return 'priority-high';
      case '중': return 'priority-medium';
      case '하': return 'priority-low';
      default: return 'priority-default';
    }
  };

  // 진행도에 따른 CSS 클래스 반환
  const getProgressClass = (progress) => {
    if (progress === 100) {
      return 'progress-complete';
    } else if (progress >= 50) {
      return 'progress-half';
    }
    return '';
  };

  const onMouseDown = (e) => {
    setDragging(true);
    setHasMoved(false);
    setOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    setDragStartPos({
      x: e.clientX,
      y: e.clientY,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  //드래그 중
  const onMouseMove = (e) => {
    if (dragging) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      if (moveDistance > 5) {
        setHasMoved(true);
        onMove(node.id, e.clientX - offset.x, e.clientY - offset.y);
      }
    }
  };

  // 드래그 종료 
  const onMouseUp = (e) => {
    setDragging(false);
    
    if (!hasMoved) {
      onClick();
    }
    
    setHasMoved(false);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 전역 마우스 이벤트 처리
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (dragging) {
        onMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (dragging) {
        onMouseUp(e);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  // 노드 크기 계산 (반지름 기반)
  const nodeSize = node.radius ? node.radius * 2 : (node.isCenter ? 120 : 80);
  const borderRadius = nodeSize / 2;

  return (
    <>
      <div
        className={`subtask-wrapper ${dragging ? 'dragging' : ''}`}
        style={{
          left: (node.x + (mapOffset?.x || 0)) - nodeSize / 2,
          top: (node.y + (mapOffset?.y || 0)) - nodeSize / 2,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`subtask-node ${node.isCenter ? 'center' : ''} ${dragging && hasMoved ? 'dragging' : ''} ${getPriorityClass(node.priority, node.isCenter)} ${getProgressClass(node.progress)}`}
          style={{
            width: nodeSize,
            height: nodeSize,
            borderRadius: borderRadius,
          }}
          onClick={handleClick}
          onMouseDown={onMouseDown}
        >
          <div className="subtask-node-content">
            <div>{node.label}</div>
            {!node.isCenter && (
              <div className="subtask-node-progress">
                {node.progress}%
              </div>
            )}
          </div>
        </div>

        {/* 호버 시 수정/삭제 버튼 (중심 노드 제외) */}
        {!node.isCenter && isHovered && (
          <div className="subtask-node-buttons">
            <button
              className="subtask-node-button edit-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditForm(true);
              }}
              title="수정"
            >
              ✏️
            </button>
            <button
              className="subtask-node-button delete-button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('이 세부 작업을 삭제하시겠습니까?')) {
                  onDelete();
                }
              }}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 수정 폼 모달 */}
      {showEditForm && (
        <EditSubtaskForm
          subtask={node.data}
          onSubmit={(updatedSubtask) => {
            onEdit(updatedSubtask);
            setShowEditForm(false);
          }}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
}

export default SubtaskNode;