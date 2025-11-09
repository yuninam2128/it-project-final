import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import SubtaskMindmap from "../components/subtask/SubtaskMindmap";
import SubtaskForm from "../components/subtask/SubtaskForm";
import "./Detail.css";
import Header from "../components/header/header";
import SubtaskTodoList from "../components/todo/SubtaskTodoList";
import JellyRewardPopup from "../components/jelly/JellyRewardPopup";
import TodoManager from "../components/todo/TodoManager";
import Sidebar from "../components/sidebar/Sidebar";
import { FirebaseProjectRepository } from "../../infrastructure/repositories/FirebaseProjectRepository";
import ProjectTimeline from "../components/project/ProjectTimeline";
import { subscribeAuth } from "../../services/auth";
import { getUserCoins, setUserCoins } from "../../services/coins";



function ProjectDetail() {
    const {projectId} = useParams();

    const [project, setProject] = useState(null);
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [subtaskPositions, setSubtaskPositions] = useState({});
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
    const [showAddForm, setShowAddForm] = useState(false);
    const [jellyReward, setJellyReward] = useState(null); //젤리 획득 팝업 표시용
    const [jellies, setJellies] = useState({ fire: 0, heart: 0, light: 0 }); //젤리 개수 상태
    const [currentUser, setCurrentUser] = useState(null); // 현재 사용자

    const projectRepository = new FirebaseProjectRepository();
    const processedTodoIdsRef = useRef(new Set()); // 처리된 Todo ID 저장 (중복 방지용)
    const processingTodoIdsRef = useRef(new Set()); // 처리 중인 Todo ID 저장 (비동기 중복 방지용)

    // 현재 사용자 구독
    useEffect(() => {
        const unsubscribe = subscribeAuth((user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);
    
        // 젤리 보상 타입을 상태 속성으로 매핑
    const mapRewardTypeToStateProperty = (type) => {
      const typeMap = {
        'heart': 'heart',
        'fire': 'fire',
        'star': 'light'  // star 타입을 light 속성으로 변환
      };
      return typeMap[type] || type;
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

    // 젤리 획득 처리 함수 (useCallback으로 메모이제이션 + 중복 방지)
    const handleJellyReward = useCallback(async (rewards, todoId) => {
      console.log('[Detail.jsx] handleJellyReward 호출:', {
        todoId,
        rewards,
        rewardsLength: rewards?.length,
        isEmpty: !rewards || rewards.length === 0,
        currentUser: currentUser?.uid
      });
      if (!rewards || rewards.length === 0) {
        console.log('[Detail.jsx] rewards가 비어있음 - return');
        return;
      }

      // TodoId 기반 중복 방지: 같은 Todo는 한 번만 처리
      // 비동기 처리 중에도 중복 방지를 위해 처리 시작 시점에 체크
      if (todoId) {
        if (processedTodoIdsRef.current.has(todoId)) {
          console.log(`[Detail.jsx] TodoId ${todoId}는 이미 처리됨 - 중복 방지`);
          return; // 이미 처리된 투두는 보상을 지급하지 않음
        }
        if (processingTodoIdsRef.current.has(todoId)) {
          console.log(`[Detail.jsx] TodoId ${todoId}는 처리 중임 - 중복 방지`);
          return; // 처리 중인 투두는 보상을 지급하지 않음
        }
        // 처리 중인 투두 ID 추가 (비동기 처리 전에 추가하여 중복 방지)
        processingTodoIdsRef.current.add(todoId);
      }

      if (!currentUser) {
        console.warn('[Detail.jsx] 사용자가 로그인하지 않았습니다. 젤리를 저장할 수 없습니다.');
        // 로그인하지 않아도 팝업은 표시
        if (todoId) {
          processingTodoIdsRef.current.delete(todoId);
        }
        setJellyReward(rewards);
        return;
      }

      try {
        // 현재 사용자의 젤리 보유 수 가져오기
        const currentCoins = await getUserCoins(currentUser.uid);
        console.log('[Detail.jsx] 현재 젤리 보유 수:', currentCoins);

        // 보상만큼 더하기
        const updatedCoins = { ...currentCoins };
        rewards.forEach(reward => {
          const fieldName = mapRewardTypeToFirebaseField(reward.type);
          if (fieldName) {
            // 명시적으로 Number로 변환하여 계산
            const currentAmount = Number(updatedCoins[fieldName] || 0);
            const rewardAmount = Number(reward.amount);
            updatedCoins[fieldName] = currentAmount + rewardAmount;
            console.log(`[Detail.jsx] Firebase 젤리 업데이트: ${reward.type}(${rewardAmount}) -> ${fieldName}: ${updatedCoins[fieldName]}`);
          }
        });

        // Firebase에 저장
        await setUserCoins(currentUser.uid, updatedCoins);
        console.log('[Detail.jsx] Firebase에 젤리 저장 완료:', updatedCoins);

        // 처리 완료: 처리 중인 ID를 제거하고 처리된 ID에 추가
        if (todoId) {
          processingTodoIdsRef.current.delete(todoId);
          processedTodoIdsRef.current.add(todoId);
        }

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
        console.error('[Detail.jsx] 젤리 저장 중 오류:', error);
        // 오류 발생 시 처리 중인 ID 제거 (재시도 가능하도록)
        if (todoId) {
          processingTodoIdsRef.current.delete(todoId);
        }
        // 오류가 발생해도 팝업은 표시
      }

      // 팝업 표시
      console.log('[Detail.jsx] setJellyReward 실행:', rewards);
      setJellyReward(rewards);
    }, [currentUser]);


    //중요도에 따른 원 크기
    const getRadius = (priority) => {
        if (priority === "상") return 75;
        if (priority === "중") return 55;
        return 40;
    };

    //초기 위치
    const generateInitialPositions = (subtasks, size) => {
        const positions = {};
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        const radius = Math.min(size.width, size.height) / 3;

        subtasks.forEach((subtask, index) => {
        const angle = (index * 2 * Math.PI) / subtasks.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const nodeRadius = getRadius(subtask.priority);

        positions[subtask.id] = {
            x: Math.max(nodeRadius, Math.min(x, size.width - nodeRadius)),
            y: Math.max(nodeRadius, Math.min(y, size.height - nodeRadius)),
            radius: nodeRadius
        };
        });

        return positions;
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const projectData = await projectRepository.getById(projectId);
                if (projectData) {
                    // subtasks가 없으면 빈 배열로 초기화
                    if (!projectData.subtasks) {
                        projectData.subtasks = [];
                    }
                    // 기존 subtask에 todos 속성이 없으면 빈 배열로 초기화
                    projectData.subtasks = projectData.subtasks.map(subtask => ({
                        ...subtask,
                        todos: subtask.todos || []
                    }));
                    setProject(projectData);
                    // console.log("프로젝트 로드됨:", projectData);
                    // console.log("서브태스크 개수:", projectData.subtasks.length);

                    if (projectData.subtasks.length > 0) {
                        const initialPositions = generateInitialPositions(projectData.subtasks, canvasSize);
                        setSubtaskPositions(initialPositions);
                    }
                }
            } catch (err) {
                console.error("프로젝트 데이터 로딩 오류:", err);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId, canvasSize, generateInitialPositions, projectRepository]);

    //새 위치
    const findAvailablePosition = () => {
        const radius = getRadius("중");
        const padding = 20;
        const maxAttempts = 100;

        for (let i = 0; i < maxAttempts; i++) {
        const x = radius + Math.random() * (canvasSize.width - 2 * radius);
        const y = radius + Math.random() * (canvasSize.height - 2 * radius);

        const isOverlapping = Object.values(subtaskPositions).some(pos => {
            const dx = pos.x - x;
            const dy = pos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < pos.radius + radius + padding;
        });

        if (!isOverlapping) return { x, y, radius };
        }

        return { x: canvasSize.width / 2, y: canvasSize.height / 2, radius };
    };

    //세부 프로젝트 추가
    const handleAddSubtask = async (newSubtask) => {
        if (!project) return;

        const subtaskId = `subtask_${Date.now()}`;

        try {
            const subtaskWithId = {
                ...newSubtask,
                id: subtaskId,
                deadline: new Date(newSubtask.deadline),
                progress: Number(newSubtask.progress),
                todos: []
            };

            const newPosition = findAvailablePosition();

            // 로컬 state 업데이트
            const updatedSubtasks = [...(project.subtasks || []), subtaskWithId];
            setProject(prev => ({ ...prev, subtasks: updatedSubtasks }));
            setSubtaskPositions(prev => ({ ...prev, [subtaskId]: newPosition }));

            // console.log("새 서브태스크 추가됨:", subtaskWithId);
            // console.log("현재 project.subtasks 길이:", updatedSubtasks.length);

            // Firebase에 업데이트된 프로젝트 저장
            await projectRepository.update(projectId, {
                subtasks: updatedSubtasks
            });

            // console.log("Firebase에 서브태스크 저장 완료");

        } catch (error) {
            console.error("서브태스크 추가 중 오류:", error);
            // 오류 발생 시 로컬 state 롤백
            setProject(prev => ({
                ...prev,
                subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
            }));
            setSubtaskPositions(prev => {
                const newPos = { ...prev };
                delete newPos[subtaskId];
                return newPos;
            });
        }
    };

    //세부 프로젝트 수정
    const handleEditSubtask = async (updatedSubtask) => {
        if (!project) return;

        try {
            const updatedSubtasks = project.subtasks.map(subtask =>
                subtask.id === updatedSubtask.id
                ? {
                    ...updatedSubtask,
                    deadline: updatedSubtask.deadline instanceof Date ? updatedSubtask.deadline : new Date(updatedSubtask.deadline),
                    progress: Number(updatedSubtask.progress)
                  }
                : subtask
            );

            setProject(prev => ({ ...prev, subtasks: updatedSubtasks }));

            const newRadius = getRadius(updatedSubtask.priority);
            setSubtaskPositions(prev => ({ ...prev, [updatedSubtask.id]: { ...prev[updatedSubtask.id], radius: newRadius } }));

            // console.log("서브태스크 수정됨:", updatedSubtask);

            // Firebase에 업데이트된 프로젝트 저장
            await projectRepository.update(projectId, {
                subtasks: updatedSubtasks
            });

            // console.log("Firebase에 서브태스크 수정 저장 완료");

        } catch (error) {
            console.error("서브태스크 수정 중 오류:", error);
        }
    };

    //세부 프로젝트 삭제
    const handleDeleteSubtask = async (subtaskId) => {
        if (!project) return;

        try {
            const updatedSubtasks = project.subtasks.filter(s => s.id !== subtaskId);

            setProject(prev => ({ ...prev, subtasks: updatedSubtasks }));
            setSubtaskPositions(prev => {
                const newPos = { ...prev };
                delete newPos[subtaskId];
                return newPos;
            });

            // console.log("서브태스크 삭제됨:", subtaskId);
            // console.log("현재 project.subtasks 길이:", updatedSubtasks.length);

            // Firebase에 업데이트된 프로젝트 저장
            await projectRepository.update(projectId, {
                subtasks: updatedSubtasks
            });

            // console.log("Firebase에 서브태스크 삭제 저장 완료");

        } catch (error) {
            // console.error("서브태스크 삭제 중 오류:", error);
        }
    };

    //위치 바뀜 감지 및 업데이트 
    const handleSubtaskPositionChange = (subtaskId, x, y) => {
        setSubtaskPositions(prev => ({
            ...prev,
            [subtaskId]: {
                ...prev[subtaskId],
                x, 
                y,
            }
        }));
    };

    //클릭 감지
    const handleSubtaskClick = (subtask) => {
        setSelectedSubtask(subtask);
        console.log("click!");
        console.log(subtask.todos);
        // setCurrentView("todo");
    };


    //추가 버튼 관리 
    const handleAddClick = () => {
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
    };

    if (!project) {
        return <div className="loading-container"><p>프로젝트를 불러오는 중...</p></div>;
    }

    //오늘 날짜 출력 
    const today = new Date();
    const formatted = today.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });


     return (
    <div className="app-container">
      <Sidebar/>
      <div className="main-content">
        <Header onAddClick={handleAddClick} jellies={jellies}/>
        <div className="content-grid">
            <div className="space-map-container">
                <SubtaskMindmap
                    project ={project}
                    positions={subtaskPositions}
                    onSubtaskClick={handleSubtaskClick}
                    onEditSubtask={handleEditSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onPositionChange={handleSubtaskPositionChange}
                    onCanvasResize={(w,h)=> setCanvasSize({width:w, height:h})}
                />
            </div>
            <div className="right-sidebar">
                <div className="card card-todo-expanded">
                    <SubtaskTodoList
                        subtask={selectedSubtask}
                        projectId={projectId}
                        onUpdateSubtask={handleEditSubtask}
                        onJellyReward={handleJellyReward}
                    />
                </div>
            </div>
        </div>
                <ProjectTimeline />

      </div>
                 {showAddForm && (
                    <SubtaskForm
                    onSubmit={(newSubtask) => {
                        handleAddSubtask(newSubtask);
                        setShowAddForm(false);
                    }}
                    onClose={handleFormClose}
                    />

                )}
                {jellyReward && (
                    <JellyRewardPopup
                        rewards={jellyReward}
                        onClose={() => setJellyReward(null)}
                    />
                )}
    </div>
  );
}

export default ProjectDetail;
