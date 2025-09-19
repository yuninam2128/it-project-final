import React, { useState } from "react";
import "./SubtaskForm.css";

function SubtaskForm({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState("중");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline || !startDate || !endDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('시작일은 종료일보다 빠를 수 없습니다.');
      return;
    }

    const subtaskData = { 
      title, 
      deadline,
      progress: Number(progress), 
      priority,
      startDate,
      endDate,
      description
    };

    onSubmit(subtaskData);
    
    // 폼 초기화
    setTitle("");
    setDeadline("");
    setProgress(0);
    setPriority("중");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  // 오늘 날짜를 기본값으로 설정하는 함수
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>세부 작업 추가</h2>
        <form onSubmit={handleSubmit}>
          <label>
            작업명 *:
            <input 
              type="text"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="세부 작업 이름을 입력하세요"
              required
            />
          </label>

          <div className="form-row">
            <label className="half-width">
              시작일 *:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getTodayString()}
                required
              />
            </label>

            <label className="half-width">
              종료일 *:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || getTodayString()}
                required
              />
            </label>
          </div>

          <label>
            최종 마감일 *:
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={endDate || getTodayString()}
              required
            />
          </label>

          <div className="form-row">
            <label className="half-width">
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

            <label className="half-width">
              중요도:
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="상">상 (긴급/중요)</option>
                <option value="중">중 (보통)</option>
                <option value="하">하 (낮음)</option>
              </select>
            </label>
          </div>

          <label>
            설명:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="세부 작업에 대한 설명을 입력하세요 (선택사항)"
              rows="3"
            />
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

export default SubtaskForm;