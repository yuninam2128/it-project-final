// EditProjectForm.js
// 이 컴포넌트는 프로젝트 정보를 수정할 수 있는 폼(모달)을 제공

import { useState } from "react";
import "./styles/EditProjectForm.css" // 스타일 파일 import

// EditProjectForm 컴포넌트 정의, project, onSubmit, onClose prop을 받음
function EditProjectForm({ project, onSubmit, onClose }) {
  // 각 입력값을 상태로 관리
  const [title, setTitle] = useState(project.title); // 프로젝트 이름
  const [deadline, setDeadline] = useState(project.deadline); // 마감일
  const [progress, setProgress] = useState(project.progress); // 진행도
  const [priority, setPriority] = useState(project.priority || "중"); // 중요도

  // 폼 제출 시 호출되는 함수
  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 기본 동작 방지
    onSubmit({
      ...project, // 기존 프로젝트 정보 유지
      title, // 수정된 이름
      deadline, // 수정된 마감일
      progress: Number(progress), // 수정된 진행도(숫자형 변환)
      priority, // 수정된 중요도
    });
    onClose(); // 모달 닫기
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>프로젝트 수정</h2>

        {/* 프로젝트 수정 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 이름 입력 */}
          <label>
            이름: 
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          {/* 마감일 입력 */}
          <label>
            마감일: 
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          {/* 진행도 입력 */}
          <label>
            진행도 (%): 
            <input
              type="number"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              min="0"
              max="100"
            />
          </label>
          {/* 중요도 선택 */}
          <label>
            중요도:
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
          </label>

          {/* 저장 및 취소 버튼 */}
          <button type="submit">저장</button>
          <button type="button" onClick={onClose}>취소</button>
        </form>

      </div>
    </div>
  );
}

export default EditProjectForm;
