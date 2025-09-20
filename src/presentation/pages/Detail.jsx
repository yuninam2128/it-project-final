import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SubtaskMindmap from "../components/subtask/SubtaskMindmap";
import SubtaskForm from "../components/subtask/SubtaskForm";
import "./Detail.css";
import Header from "../components/header/header";
import TodoManager from "../components/todo/TodoManager";
import Sidebar from "../components/sidebar/Sidebar";
import { FirebaseProjectRepository } from "../../infrastructure/repositories/FirebaseProjectRepository";
import ProjectTimeline from "../components/project/ProjectTimeline";



function ProjectDetail() {
    const {projectId} = useParams();

    const [project, setProject] = useState(null);
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [subtaskPositions, setSubtaskPositions] = useState({});
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
    const [showAddForm, setShowAddForm] = useState(false);

    const projectRepository = new FirebaseProjectRepository();

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


  return (
    <div className="App">
    <div className="body-detail">
        <div className="container-detail">
            {/* 이 부분을 '지우고' sidebar컴포넌트를 넣는다. */}
            {/* 단, sidebar 컴포넌트 전체를 감싼 div태그 className은 무조건 sidebar로 할 것 */}
            <div className="sidebar-detail">
                <Sidebar />
            </div>

            <div className="main-wrapper-detail">
                <Header onAddClick={handleAddClick}/>    
                <article className="main-article-detail">
                        <div className="date-detail">2025년 09월 10일</div>
                        <div className="title-detail">
                            <span className="highlight-detail">{project.title}</span>의 행성들을 정복해보아요!
                        </div>
                </article>
                <main className="content-area-detail">
                    <SubtaskMindmap
                        project ={project}
                        positions={subtaskPositions}
                        onSubtaskClick={handleSubtaskClick}
                        onEditSubtask={handleEditSubtask}
                        onDeleteSubtask={handleDeleteSubtask}
                        onPositionChange={handleSubtaskPositionChange}
                        onCanvasResize={(w,h)=> setCanvasSize({width:w, height:h})}
                    />
                    <TodoManager
                        subtask={selectedSubtask}
                        onUpdateSubtask={handleEditSubtask}
                    />
                    {/* <section className="main-content"></section> */}
                    {/* <section className="todo-bar"></section> */}
                </main>

                {/* 마찬가지로 이 부분을 '지우고' 타임라인 컴포넌트를 넣는다. */}
                {/* 단, timeline 컴포넌트 전체를 감싼 div태그 className은 무조건 timeline로 할 것 */}
                <footer className="timeline-detail">
                    <ProjectTimeline />
                </footer>
                {showAddForm && (
                    <SubtaskForm
                    onSubmit={(newSubtask) => {
                        handleAddSubtask(newSubtask);
                        setShowAddForm(false);
                    }}
                    onClose={handleFormClose}
                    />

                )}
            </div>
        </div>
    </div>
    </div>
  );
}

export default ProjectDetail;
