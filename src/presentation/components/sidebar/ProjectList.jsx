import { useNavigate } from "react-router-dom";
import "./ProjectList.css"; // CSS 파일 import 추가
import { ChevronRight } from 'lucide-react';

function ProjectList({ projects }) { // 1. props를 { projects }로 구조 분해하여 받습니다.
  const navigate = useNavigate(); // 2. 변수명을 소문자 navigate로 변경합니다.

  // projects가 비어있거나 없을 경우를 대비한 처리
  if (!projects || projects.length === 0) {
    return <p className="no-projects-message">진행중인 프로젝트가 없습니다.</p>;
  }

  return (

                <div className="project-list">
                  <span className="project-list-title">프로젝트 목록</span>
                  <ul className="project-list-items">
                    {projects.map((project) => (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="project-category">
                        <div>
                          <ChevronRight size={16} />
                          <span>{project.title}</span>
                        </div>
                      </div>
                      <ul className="project-subitems">
                        {project.subtasks.map((subtask) => (
                          <li 
                            key={subtask.id}
                            className="project-subitem"
                            onClick={() => navigate(`/subtask/${subtask.id}`)}
                            >
                            {subtask.title}
                          </li>
                        ))}
                      </ul>
                    </li>
                    ))}
                  </ul>
                </div>
  );
}

export default ProjectList;