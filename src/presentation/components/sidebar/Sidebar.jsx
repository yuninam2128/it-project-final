// Sidebar 컴포넌트 - 기존 구조 유지하면서 데이터만 독립적으로 가져오기
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProjectList from "./ProjectList.jsx";
import "./Sidebar.css";
import { subscribeAuth } from '../../../services/auth';
import { subscribeToUserProjects } from '../../../services/projects';
import { Home, Search, UserRound, User, Store } from 'lucide-react';

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

  // 사이드바 확장 상태
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
      <div 
        className={`sidebar ${sidebarExpanded ? 'sidebar-expanded' : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
              <img 
                src="/images/logo-icon.svg"
                alt="로고이미지"
                className="logo-icon"/>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            <button 
              className="nav-item nav-item-inactive"
            >
              <Search size={24} strokeWidth={1.5}/>
              {sidebarExpanded && <span>검색</span>}
            </button>
            <button 
              className="nav-item nav-item-active"
              onClick={() => navigate("/home")}
            >
              <Home size={24} strokeWidth={1.5}/>
              {sidebarExpanded && <span>메인 프로젝트 홈</span>}
            </button>
            <button 
              className="nav-item nav-item-inactive"
              onClick={() => navigate("/store", {state : {projects: projects}})}
            >
              <Store size={24} strokeWidth={1.5}/>
              {sidebarExpanded && <span>캐릭터 상점</span>}
            </button>

            {sidebarExpanded && (
              <>
                <div className="nav-divider"></div>
                {/* Project List */}
                <ProjectList projects={projects} />

              </>
            )}
          </nav>

          {/* User Profile */}
          <div className="sidebar-profile">
            <img 
              src = "/images/big-profile.png"
              className="profile-avatar"/>
            {sidebarExpanded && (
              <div className="profile-info">
                <div className="profile-name">남지윤</div>
                <div className="profile-upgrade">Plan upgrade &gt;</div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default Sidebar;