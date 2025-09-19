import React, { useState } from "react";
import "./SubtaskForm.css";

function EditSubtaskForm({ subtask, onSubmit, onClose }) {
  const [title, setTitle] = useState(subtask.title || "");
  const [deadline, setDeadline] = useState(
    subtask.deadline instanceof Date 
      ? subtask.deadline.toISOString().split('T')[0]
      : subtask.deadline || ""
  );
  const [progress, setProgress] = useState(subtask.progress || 0);
  const [priority, setPriority] = useState(subtask.priority || "중");
  const [startDate, setStartDate] = useState(subtask.startDate || "");
  const [endDate, setEndDate] = useState(subtask.endDate || "");
  const [description, setDescription] = useState(subtask.description || "");

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

    const updatedSubtask = {
      ...subtask,
      title,
      deadline,
      progress: Number(progress),
      priority,
      startDate,
      endDate,
      description
    };

    onSubmit(updatedSubtask);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>세부 작업 수정</h2>
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
                required
              />
            </label>

            <label className="half-width">
              종료일 *:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
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
              min={endDate}
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
            <button type="submit" className="submit-btn">수정</button>
            <button type="button" className="cancel-btn" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubtaskForm;