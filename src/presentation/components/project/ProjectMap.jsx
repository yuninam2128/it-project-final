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
  //const mapContainerRef = useRef(null);
  //const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });


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

  // 디버깅: 프로젝트와 위치 정보 로깅
  useEffect(() => {
    console.log('=== ProjectMap 렌더링 ===');
    console.log('프로젝트 개수:', projects.length);
    console.log('위치 개수:', Object.keys(positions).length);
    console.log('프로젝트 ID 목록:', projects.map(p => p.id));
    console.log('위치 키 목록:', Object.keys(positions));
    
    projects.forEach(project => {
      const pos = getPosition(project.id);
      console.log(`프로젝트 ${project.id} (${project.title}):`, {
        hasPosition: !!positions[project.id],
        position: positions[project.id],
        calculatedPosition: pos
      });
    });
  }, [projects, positions]);

  return (
    <div 
      className="project-map"
      onMouseDown={handleMouseDown}
      style={{
        userSelect: (isPanning || !!draggingProjectIdRef.current) ? "none" : "auto",
        cursor: (draggingProjectIdRef.current ? "grabbing" : (isPanning ? "grabbing" : "grab")),
      }}
    >
      {projects.length === 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px'
        }}>
          프로젝트가 없습니다. 프로젝트를 추가해보세요!
        </div>
      )}
      {projects.map((project) => {
        const pos = getPosition(project.id);
        if (!pos || (pos.top === 0 && pos.left === 0)) {
          console.warn(`프로젝트 ${project.id}의 위치가 없습니다.`, {
            project,
            positions,
            calculatedPos: pos
          });
        }
        return (
          <Project
            key={project.id}
            project={project}
            onDeleteProject={onDeleteProject}
            onEditProject={onEditProject}
            position={pos}
            onMouseDownProject={handleMouseDownProject}
            preventNavigate={!!(draggingProjectIdRef.current || dragStartedRef.current)}
          />
        );
      })}
    </div>
  );
}

export default ProjectMap;




  /*
  // 컨테이너 크기 감지 및 업데이트
  useEffect(() => {
    const updateContainerSize = () => {
      if (mapContainerRef.current) {
        setContainerSize({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight,
        });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  // Circle이 컨테이너 경계 내에 있도록 제한
  const clampPositionToBounds = (x, y, radius) => {
    const minX = radius;
    const maxX = containerSize.width - radius;
    const minY = radius;
    const maxY = containerSize.height - radius;

    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  const getPosition = (id) => {
    const pos = overlayPositions[id] || (draftPositionsRef.current && draftPositionsRef.current[id]) || positions[id];

    if (!pos) return { top: 0, left: 0 };

    // 원의 중심이 컨테이너 내부에 있도록 제한
    const clampedPos = clampPositionToBounds(pos.x, pos.y, pos.radius);

    return {
      top: clampedPos.y - pos.radius + mapOffset.y,
      left: clampedPos.x - pos.radius + mapOffset.x,
    };
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

      // 새로운 위치 계산 및 경계 제한 적용
      const newX = current.x + dx;
      const newY = current.y + dy;
      const clampedPos = clampPositionToBounds(newX, newY, current.radius);

      draftPositionsRef.current = {
        ...draftPositionsRef.current,
        [id]: { x: clampedPos.x, y: clampedPos.y, radius: current.radius }
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
      ref={mapContainerRef}
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
*/