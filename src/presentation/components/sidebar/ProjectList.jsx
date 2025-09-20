import { useNavigate } from "react-router-dom";
import "./ProjectList.css"; // CSS 파일 import 추가

function ProjectList({ projects }) { // 1. props를 { projects }로 구조 분해하여 받습니다.
  const navigate = useNavigate(); // 2. 변수명을 소문자 navigate로 변경합니다.

  // projects가 비어있거나 없을 경우를 대비한 처리
  if (!projects || projects.length === 0) {
    return <p className="no-projects-message">진행중인 프로젝트가 없습니다.</p>;
  }

  return (
    <ul className="project-list">
      {projects.map((project) => (
        <li
          key={project.id}
          className="project-item" // CSS 클래스를 추가하여 스타일을 적용합니다.
          onClick={() => navigate(`/project/${project.id}`)} // 3. 소문자 navigate 함수를 사용합니다.
        >
          {project.title}
        </li>
      ))}
    </ul>
  );
}

export default ProjectList;