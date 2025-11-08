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
import { subscribeAuth, getCurrentUserDisplayName } from '../../services/auth';
import { getUserCoins, setUserCoins } from '../../services/coins';
import {
  createProject,
  updateProject,
  deleteProject as deleteProjectFromDB,
  updateProjectPosition,
  subscribeToUserProjects,
  subscribeToSubtaskTodos
} from '../../services/projects';

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
  const [allTodos, setAllTodos] = useState([]); // 모든 투두 리스트
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

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
  const formatDateToString = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // 모든 subtask의 todos를 실시간으로 구독
  useEffect(() => {
    if (!currentUser || !projects || projects.length === 0) {
      setAllTodos([]);
      return;
    }

    // 모든 subtask에 대해 todos 구독
    const unsubscribes = [];
    const todosMap = new Map(); // projectId-subtaskId를 키로 사용

    projects.forEach(project => {
      if (!project.subtasks || !Array.isArray(project.subtasks)) return;

      project.subtasks.forEach(subtask => {
        if (!subtask.id) return;

        const key = `${project.id}-${subtask.id}`;
        const subtaskDeadline = subtask.deadline ? formatDateToString(subtask.deadline) : null;
        
        const unsubscribe = subscribeToSubtaskTodos(project.id, subtask.id, (todosData) => {
          // todosData는 { "YYYY-MM-DD": [todos] } 형태
          const todosList = [];
          Object.entries(todosData || {}).forEach(([dateKey, todosArray]) => {
            if (Array.isArray(todosArray)) {
              todosArray.forEach(todo => {
                todosList.push({
                  ...todo,
                  id: todo.id || Date.now().toString(),
                  date: dateKey, // 생성일
                  deadline: subtaskDeadline, // 마감일
                  projectId: project.id,
                  subtaskId: subtask.id,
                  subtaskTitle: subtask.title,
                });
              });
            }
          });

          // 해당 subtask의 todos 업데이트
          todosMap.set(key, todosList);

          // 모든 todos를 배열로 변환
          const allTodosArray = Array.from(todosMap.values()).flat();
          setAllTodos(allTodosArray);
        });

        unsubscribes.push(unsubscribe);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser, projects]);

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

  // 젤리 보상 타입을 Firebase 필드명으로 매핑
  const mapRewardTypeToFirebaseField = (type) => {
    const typeMap = {
      'heart': 'heartJelly',
      'fire': 'fireJelly',
      'star': 'lightJelly'  // star 타입을 lightJelly로 변환
    };
    return typeMap[type] || null;
  };

  // 젤리 보상 타입을 상태 속성으로 매핑
  const mapRewardTypeToStateProperty = (type) => {
    const typeMap = {
      'heart': 'heart',
      'fire': 'fire',
      'star': 'light'  // star 타입을 light 속성으로 변환
    };
    return typeMap[type] || type;
  };

  // 젤리 획득 처리 함수
  const handleJellyReward = async (rewards, todoId) => {
    console.log('[Home.jsx] handleJellyReward 호출:', {
      todoId,
      rewards,
      rewardsLength: rewards?.length,
      isEmpty: !rewards || rewards.length === 0,
      currentUser: currentUser?.uid
    });
    
    if (!rewards || rewards.length === 0) {
      console.log('[Home.jsx] rewards가 비어있음 - return');
      return;
    }

    if (!currentUser) {
      console.warn('[Home.jsx] 사용자가 로그인하지 않았습니다. 젤리를 저장할 수 없습니다.');
      // 로그인하지 않아도 팝업은 표시
      setJellyReward(rewards);
      return;
    }

    try {
      // 현재 사용자의 젤리 보유 수 가져오기
      const currentCoins = await getUserCoins(currentUser.uid);
      console.log('[Home.jsx] 현재 젤리 보유 수:', currentCoins);

      // 보상만큼 더하기
      const updatedCoins = { ...currentCoins };
      rewards.forEach(reward => {
        const fieldName = mapRewardTypeToFirebaseField(reward.type);
        if (fieldName) {
          // 명시적으로 Number로 변환하여 계산
          const currentAmount = Number(updatedCoins[fieldName] || 0);
          const rewardAmount = Number(reward.amount);
          updatedCoins[fieldName] = currentAmount + rewardAmount;
          console.log(`[Home.jsx] Firebase 젤리 업데이트: ${reward.type}(${rewardAmount}) -> ${fieldName}: ${updatedCoins[fieldName]}`);
        }
      });

      // Firebase에 저장
      await setUserCoins(currentUser.uid, updatedCoins);
      console.log('[Home.jsx] Firebase에 젤리 저장 완료:', updatedCoins);

      // 로컬 state도 업데이트 (UI 반응성 향상)
      setJellies(prev => {
        const updated = { ...prev };
        rewards.forEach(reward => {
          const stateProperty = mapRewardTypeToStateProperty(reward.type);
          updated[stateProperty] = (updated[stateProperty] || 0) + Number(reward.amount);
        });
        return updated;
      });
    } catch (error) {
      console.error('[Home.jsx] 젤리 저장 중 오류:', error);
      // 오류가 발생해도 팝업은 표시
    }

    // 팝업 표시
    console.log('[Home.jsx] setJellyReward 실행:', rewards);
    setJellyReward(rewards);
  };

  // 오늘 날짜 문자열 반환 (YYYY-MM-DD) - 로컬 시간대 기준
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  console.log(`projects:`, projects);
  console.log(`allTodos:`, allTodos);
  console.log(`today:`, getCurrentDate());

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
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Space Map - 2 columns */}
        <div className="space-map-container">
          <div className="space-map-header">
            <h2 className="space-map-title">메인 프로젝트 우주 맵</h2>
            {/*<button className="space-map-add-button">프로젝트 추가</button>*/}
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
            <TodaysTodo 
              todos={allTodos} 
              currentDate={getCurrentDate()}
              projects={projects}
              onJellyReward={handleJellyReward}
            />
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