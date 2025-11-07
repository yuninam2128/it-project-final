// Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/header";
import ProjectMap from "../components/project/ProjectMap";
import TodoList from "../components/todo/TodoList";
import Sidebar from "../components/sidebar/Sidebar";
import Inspiration from "../components/inspiration/Inspiration";
import ProjectTimeline from "../components/project/ProjectTimeline";
import ProjectForm from "../components/project/ProjectForm";
import JellyRewardPopup from "../components/jelly/JellyRewardPopup";
import "./Home.css";
import TodaysTodo from "../components/todo/TodaysTodo";
import { subscribeAuth, getCurrentUserDisplayName } from '../../services/mockAuth';
import {
  createProject,
  updateProject,
  deleteProject as deleteProjectFromDB,
  updateProjectPosition,
  subscribeToUserProjects
} from '../../services/mockProjects';

// Mock 데이터 사용 (Firebase 연결 제거)
// Firebase 복구 시: mockAuth → auth, mockProjects → projects로 변경

function Home() {
  const [projects, setProjects] = useState([]); //현재 사용자 프로젝트 리스트 저장
  const [showForm, setShowForm] = useState(false); //프로젝트 추가 폼 모달 표시 여부
  const [positions, setPositions] = useState({}); //프로젝트 위치 정보
  const [currentUser, setCurrentUser] = useState(null); //현재 로그인한 사용자 정보
  const [isLoading, setIsLoading] = useState(true); //로딩 여부 상태
  const navigate = useNavigate(); //페이지 이동 함수
  const [displayName, setDisplayName] = useState(''); //이름 가져오는 중인지 여부
  const [isLoadingName, setIsLoadingName] = useState(true);
  const [jellies, setJellies] = useState({ fire: 0, heart: 0, light: 0 }); //젤리 개수
  const [jellyReward, setJellyReward] = useState(null); //젤리 획득 팝업 표시용
  // const today = getCurrentDate(); // 오늘 날짜 변수

  //로그인 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      
      if (user) {
        setIsLoadingName(true);
        try {
          const name = await getCurrentUserDisplayName();
          console.log('Display name retrieved:', name);
          setDisplayName(name || '사용자');
        } catch (error) {
          console.error('Error getting display name:', error);
          setDisplayName('사용자');
        } finally {
          setIsLoadingName(false);
        }
      } else {
        setDisplayName('');
        setIsLoadingName(false);
        setProjects([]);
        setPositions({});
        navigate('/');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // 사용자의 프로젝트 실시간 구독
  useEffect(() => {
    if (!currentUser) return;

    console.log('프로젝트 실시간 구독 시작:', currentUser.uid);

    const unsubscribe = subscribeToUserProjects(currentUser.uid, ({ projects: userProjects, positions: userPositions }) => {
      console.log('프로젝트 데이터 업데이트:', userProjects, userPositions);

      // Firebase Timestamp 관련 로깅 제거

      setProjects(userProjects);
      setPositions(userPositions);
    });

    return () => {
      console.log('프로젝트 구독 해제');
      unsubscribe();
    };
  }, [currentUser]);

  // 중요도에 따른 원 크기 반환 
  const getRadius = (priority) => {
    if (priority === "상") return 75;
    if (priority === "중") return 55;
    return 40;
  };

  //프로젝트 추가
  const handleAddProject = async (newProject) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    console.log('새 프로젝트 생성 시작:', newProject);

    try {
      const radius = getRadius(newProject.priority);
      const padding = 20;
      const tryLimit = 500;

      // 실제 project-map-container 크기를 기반으로 계산
      const mapContainer = document.querySelector('.space-map-container > .project-map-container');
      let mapWidth = window.innerWidth - 300; // 기본값 (사이드바 너비 300px)
      let mapHeight = window.innerHeight - 400; // 기본값 (헤더, 타임라인 등 제외)

      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        mapWidth = rect.width;
        mapHeight = rect.height;
      }

      const centerX = mapWidth / 2;
      const centerY = mapHeight / 2;

      let x = 0;
      let y = 0;
      let placed = false;
      let attempt = 0;

      const isOverlapping = (cx, cy, r, allPositions) => {
        return Object.values(allPositions).some((pos) => {
          const dx = pos.x - cx;
          const dy = pos.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < pos.radius + r + padding;
        });
      };

      const isWithinMapArea = (cx, cy, r) => {
        return cx - r >= 0 && cx + r <= mapWidth && cy - r >= 0 && cy + r <= mapHeight;
      };

      const numExisting = Object.keys(positions).length;

      // 첫 프로젝트 중앙 배치
      if (numExisting === 0) {
        x = centerX;
        y = centerY;
        placed = true;
      } else {
        //기존 프로젝트 주위에 배치 시도
        const maxDistance = Math.max(mapWidth, mapHeight);
        const step = radius + padding;
        
        for (let distance = step; distance <= maxDistance && !placed && attempt < tryLimit; distance += step) {
          const circumference = 2 * Math.PI * distance;
          const angleStep = Math.max(0.1, (2 * Math.PI) / Math.max(8, circumference / (radius * 2)));
          
          for (let angle = 0; angle < 2 * Math.PI && !placed && attempt < tryLimit; angle += angleStep) {
            const existingPositions = Object.values(positions);
            
            for (const existingPos of existingPositions) {
              if (placed || attempt >= tryLimit) break;
              
              const cx = existingPos.x + Math.cos(angle) * distance;
              const cy = existingPos.y + Math.sin(angle) * distance;
              
              attempt++;
              
              if (isWithinMapArea(cx, cy, radius) && !isOverlapping(cx, cy, radius, positions)) {
                x = cx;
                y = cy;
                placed = true;
                break;
              }
            }
          }
        }
        
        // 그래도 실패하면 격자 방식으로 탐색
        if (!placed) {
          const gridSize = Math.min(radius * 2 + padding, 50);

          for (let gx = radius; gx <= mapWidth - radius && !placed && attempt < tryLimit; gx += gridSize) {
            for (let gy = radius; gy <= mapHeight - radius && !placed && attempt < tryLimit; gy += gridSize) {
              attempt++;

              if (!isOverlapping(gx, gy, radius, positions)) {
                x = gx;
                y = gy;
                placed = true;
                break;
              }
            }
          }
        }

        // 최후 수단 : 랜덤 배치
        if (!placed) {
          const maxRandomAttempts = 200;
          for (let i = 0; i < maxRandomAttempts && !placed; i++) {
            const rx = radius + Math.random() * (mapWidth - 2 * radius);
            const ry = radius + Math.random() * (mapHeight - 2 * radius);
            
            if (!isOverlapping(rx, ry, radius, positions)) {
              x = rx;
              y = ry;
              placed = true;
            }
          }
        }
      }

      // 프로젝트를 배치할 공간이 부족합니다.
      if (!placed) {
        alert("프로젝트를 배치할 공간이 부족합니다. 화면을 확대하거나 일부 프로젝트를 삭제해주세요.");
        return;
      }

      const position = { x, y, radius };

      // 파이어베이스에 저장 (실시간 구독으로 UI 반영)
      await createProject({
        ...newProject,
        ownerId: currentUser.uid,
        position,
        subtasks: []
      });
      console.log('프로젝트가 파이어베이스에 저장되었습니다.');
      
    } catch (error) {
      console.error('프로젝트 추가 중 오류:', error);
      alert('프로젝트 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  //프로젝트 수정
  const editProject = async (updatedProject) => {
    if (!currentUser) return;

    try {
      // 업데이트 가능한 필드만 선별
      const { id, title, deadline, progress, priority, description } = updatedProject;
      const updateData = {
        title,
        deadline, // 이미 Timestamp 형식
        progress,
        priority
      };
      
      // description이 있으면 포함
      if (description !== undefined) {
        updateData.description = description;
      }
      
      await updateProject(id, updateData);
      
      console.log('프로젝트가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('프로젝트 수정 중 오류:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  //프로젝트 삭제
  const deleteProject = async (id) => {
    if (!currentUser) return;

    try {
      // 데이터베이스에서 프로젝트 삭제
      await deleteProjectFromDB(id);

      console.log('프로젝트가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 프로젝트 일부 필드 업데이트 (TodoList에서 사용)
  const handleUpdateProject = async (projectId, updates) => {
    if (!currentUser) return;

    try {
      await updateProject(projectId, updates);
      console.log('프로젝트가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로젝트 업데이트 중 오류:', error);
      alert('프로젝트 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 프로젝트 위치 변경 시 데이터베이스 업데이트
  const handlePositionChange = async (newPositions) => {
    if (!currentUser) return;

    try {
      // 변경된 위치만 찾아서 업데이트
      const changedPositions = {};

      Object.keys(newPositions).forEach(projectId => {
        const oldPos = positions[projectId];
        const newPos = newPositions[projectId];

        if (!oldPos ||
            oldPos.x !== newPos.x ||
            oldPos.y !== newPos.y ||
            oldPos.radius !== newPos.radius) {
          changedPositions[projectId] = newPos;
        }
      });

      if (Object.keys(changedPositions).length > 0) {
        // 각각의 변경된 프로젝트 위치를 개별적으로 업데이트
        await Promise.all(
          Object.entries(changedPositions).map(([projectId, position]) =>
            updateProjectPosition(projectId, position)
          )
        );
        console.log('프로젝트 위치가 성공적으로 업데이트되었습니다.');
      }

      // UI 상태는 실시간 구독을 통해 자동으로 업데이트됨
    } catch (error) {
      console.error('프로젝트 위치 업데이트 중 오류:', error);
      // 에러가 발생해도 UI는 일시적으로 업데이트 (사용자 경험 개선)
      setPositions(newPositions);
    }
  };

  // 젤리 획득 처리 함수
  const handleJellyReward = (rewards) => {
    if (!rewards || rewards.length === 0) return;

    // 팝업 표시
    setJellyReward(rewards);

    // 젤리 개수 업데이트
    const newJellies = { ...jellies };
    rewards.forEach(reward => {
      if (reward.type === 'heart') {
        newJellies.heart += reward.amount;
      } else if (reward.type === 'star') {
        newJellies.light += reward.amount; // 별 젤리는 light로 관리
      } else if (reward.type === 'fire') {
        newJellies.fire += reward.amount;
      }
    });
    setJellies(newJellies);
  };

  // 오늘 날짜 문자열 반환 (YYYY-MM-DD)
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return null; // 이미 navigate('/')로 리다이렉트됨
  }

  return ( 
    <div className="app-container">
      <Sidebar/>
      <div className="main-content">
        <Header
            isLoadingName={isLoadingName}
            displayName={displayName}
            currentDate={getCurrentDate()}
            onAddClick={() => setShowForm(true)}
            jellies={jellies}
        />
      {/* Date and Title */}
      <div className="title-section">
        <div className="date-text">2025년 09월 10일</div>
        <h1 className="main-title">
          남지윤님, <span className="title-highlight">오늘은 어떤 우주를 정복해볼까요?</span>
        </h1>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Space Map - 2 columns */}
        <div className="space-map-container">
          <div className="space-map-header">
            <h2 className="space-map-title">메인 프로젝트 우주 맵</h2>
            <button className="space-map-add-button">프로젝트 추가</button>
          </div>

          {/* Background pattern */}
          <div className="space-map-pattern"></div>

          {/* Orbs Container */}
          <div className="project-map-container">
             <ProjectMap
                projects={projects}
                positions={positions}
                onDeleteProject={deleteProject}
                onEditProject={editProject}
                onPositionsChange={handlePositionChange}
              />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          {/* Today's Tasks */}
            <TodaysTodo/>
          {/* Inspiration Card */}
          <div className="card card-inspiration">
            <Inspiration />
          </div>
        </div>
      </div>
        <ProjectTimeline projects= {projects}/>
              {showForm && (
                <ProjectForm
                  onSubmit={handleAddProject}
                  onClose={() => setShowForm(false)}
                />
              )}
              {jellyReward && (
                <JellyRewardPopup
                  rewards={jellyReward}
                  onClose={() => setJellyReward(null)}
                />
              )}
      </div>
    </div>
  );
}

export default Home;