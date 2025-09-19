// ProjectForm.js
// 📌 이 컴포넌트는 새로운 프로젝트를 추가하기 위한 모달 폼을 제공한다.
import { useState } from "react";
import "./styles/ProjectForm.css";

function ProjectForm({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(""); // 문자열로 유지
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState("중");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    console.log('📝 ProjectForm - Raw deadline input:', deadline);

    try {
      // deadline 문자열을 Date 객체로 변환
      const deadlineDate = new Date(deadline);
      
      // 유효한 날짜인지 확인
      if (isNaN(deadlineDate.getTime())) {
        alert('유효하지 않은 날짜입니다.');
        return;
      }

      // 시간을 23:59:59로 설정 (하루의 끝으로)
      deadlineDate.setHours(23, 59, 59, 999);
      
      console.log('📝 ProjectForm - Converted to Date:', deadlineDate);

      const projectData = { 
        title, 
        // Firebase Timestamp 제거: Date 객체 그대로 전달
        deadline: deadlineDate, 
        progress: Number(progress), 
        priority 
      };

      console.log('📝 ProjectForm - Final project data:', projectData);

      onSubmit(projectData);
      
      // 폼 초기화
      setTitle("");
      setDeadline("");
      setProgress(0);
      setPriority("중");
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    }
  };

  // 오늘 날짜를 기본값으로 설정하는 함수
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>프로젝트 추가</h2>
        <form onSubmit={handleSubmit}>
          <label>
            프로젝트명:
            <input 
              type="text"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              required
            />
          </label>

          <label>
            마감일:
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)} // 문자열로 직접 저장
              min={getTodayString()} // 오늘 이전 날짜 선택 방지
              required
            />
          </label>

          <label>
            진행도 (%):
            <input
              type="number"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              min="0"
              max="100"
              step="1"
            />
          </label>

          <label>
            중요도:
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
          </label>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">추가</button>
            <button type="button" className="cancel-btn" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;