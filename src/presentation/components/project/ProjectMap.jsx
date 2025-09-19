// ProjectMap.jsx
// 📌 이 컴포넌트는 전체 프로젝트들을 '맵' 형태로 배치하고, 마우스로 드래그하여 맵을 이동(panning)할 수 있게 한다.
import { useEffect, useState, useRef } from "react";
import Project from "./Project";
import "./styles/ProjectMap.css";

function ProjectMap({ projects, positions, onDeleteProject, onEditProject, onPositionsChange }) {
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState(null);
  const draggingProjectIdRef = useRef(null);
  const draftPositionsRef = useRef(null);
  const [overlayPositions, setOverlayPositions] = useState({});
  const dragStartedRef = useRef(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  const getPosition = (id) => {
    const pos = overlayPositions[id] || (draftPositionsRef.current && draftPositionsRef.current[id]) || positions[id];
    return pos
      ? {
          top: pos.y - pos.radius + mapOffset.y,
          left: pos.x - pos.radius + mapOffset.x,
        }
      : { top: 0, left: 0 };
  };

  const handleMouseDown = (e) => {
    if (!e.target.closest('.project-container')) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDownProject = (projectId, e) => {
    e.stopPropagation();
    e.preventDefault();
    draggingProjectIdRef.current = projectId;
    draftPositionsRef.current = { ...positions, ...overlayPositions };
    setLastMousePos({ x: e.clientX, y: e.clientY });
    dragStartedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!lastMousePos) return;

    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    if (draggingProjectIdRef.current) {
      const id = draggingProjectIdRef.current;
      const current = draftPositionsRef.current?.[id] || positions[id];
      if (!current) return;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragStartedRef.current = true;
      }
      draftPositionsRef.current = {
        ...draftPositionsRef.current,
        [id]: { x: current.x + dx, y: current.y + dy, radius: current.radius }
      };
    } else if (isPanning) {
      setMapOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (draggingProjectIdRef.current && draftPositionsRef.current) {
      const id = draggingProjectIdRef.current;
      const updated = { [id]: draftPositionsRef.current[id] };
      // 화면에 즉시 고정 (낙관적 반영)
      setOverlayPositions(prev => ({ ...prev, ...updated }));
      onPositionsChange && onPositionsChange(updated);
    }
    draggingProjectIdRef.current = null;
    draftPositionsRef.current = null;
    setIsPanning(false);
    setLastMousePos(null);
    // 클릭 이벤트 단계에서 네비게이션 방지 후 해제
    if (dragStartedRef.current) {
      setTimeout(() => { dragStartedRef.current = false; }, 0);
    }
  };

  // 실시간 구독으로 positions가 업데이트되면 overlay와 일치하는 항목들 제거
  useEffect(() => {
    if (!overlayPositions || Object.keys(overlayPositions).length === 0) return;
    const toRemove = [];
    Object.entries(overlayPositions).forEach(([id, pos]) => {
      const cur = positions[id];
      if (cur && cur.x === pos.x && cur.y === pos.y && cur.radius === pos.radius) {
        toRemove.push(id);
      }
    });
    if (toRemove.length > 0) {
      setOverlayPositions(prev => {
        const next = { ...prev };
        toRemove.forEach(id => { delete next[id]; });
        return next;
      });
    }
  }, [positions, overlayPositions]);

  return (
    <div 
      className="project-map"
      onMouseDown={handleMouseDown}
      style={{
        userSelect: (isPanning || !!draggingProjectIdRef.current) ? "none" : "auto",
        cursor: (draggingProjectIdRef.current ? "grabbing" : (isPanning ? "grabbing" : "grab")),
      }}
    >
      {projects.map((project) => (
        <Project
          key={project.id}
          project={project}
          onDeleteProject={onDeleteProject}
          onEditProject={onEditProject}
          position={getPosition(project.id)}
          onMouseDownProject={handleMouseDownProject}
          preventNavigate={!!(draggingProjectIdRef.current || dragStartedRef.current)}
        />
      ))}
    </div>
  );
}

export default ProjectMap;