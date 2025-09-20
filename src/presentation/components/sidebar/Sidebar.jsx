// Sidebar 컴포넌트 - 기존 구조 유지하면서 데이터만 독립적으로 가져오기
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProjectList from "./ProjectList.jsx";
import "./Sidebar.css";
import { subscribeAuth } from '../../../services/auth';
import { subscribeToUserProjects } from '../../../services/projects';

function Sidebar() {
  const navigate = useNavigate();
  
  // 자체적으로 프로젝트 데이터 관리
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 사용자 인증 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
      if (!user) {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 사용자의 프로젝트 실시간 구독
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserProjects(
      currentUser.uid, 
      ({ projects: userProjects }) => {
        setProjects(userProjects);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="sidebar">
      <div className="menu-section">
        <button 
          className="game-button search"
          onClick={() => navigate("/home")}
        >
          <img src="/images/homeIcon.png" alt="홈 아이콘"/>
          <p>홈 화면</p>
        </button>
        <button 
          className="game-button store"
          onClick={() => navigate("/store", {state: {projects: projects}})}
        >
          <img src="/images/storeIcon.png" alt="스토어 아이콘"/>
          <p>스토어</p>
        </button>
        <button 
          className="game-button logout"
          onClick={() => navigate("/")}
        >
          <img src="/images/signoutIcon.png" alt="로그아웃 아이콘"/>
          <p>로그아웃</p>
        </button>
      </div>
      <div>
        <h3>프로젝트 목록</h3>
        <ProjectList 
          projects={projects}
        />
      </div>
    </div>
  );
}

export default Sidebar;