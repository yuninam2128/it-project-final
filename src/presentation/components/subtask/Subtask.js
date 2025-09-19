// Subtask.js
// 이 컴포넌트는 하나의 "하위 작업(Subtask)"을 카드 형태로 표시한다.

// - props: subtask(하위 작업 데이터), onDeleteSubtask(삭제 함수), onEditSubtask(수정 함수)
// - 제목, 마감일, 진행도를 표시
// - 수정 버튼 클릭 시 EditSubtaskForm을 열어 하위 작업 수정 가능
// - 삭제 버튼 클릭 시 부모로 삭제 요청 전달

import { useState } from "react";
import EditSubtaskForm from "./EditSubtaskForm";

function Subtask({
  subtask,
  onDeleteSubtask,
  onEditSubtask,
}) {
  //수정 폼 표시 여부
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="subtask-card">
      {/* 하위 작업 제목 */}
      <h1>{subtask.title}</h1>
      
      {/* 하위 작업 마감일 */}
      <p>마감일: {subtask.deadline}</p>
      
      {/* 하위 작업 진행도 */}
      <p>진행도: {subtask.progress}%</p>

      {/* 수정 버튼 → 수정 폼 열기 */}
      <button onClick={() => setShowEditForm(true)}>수정</button>

      {/* 삭제 버튼 → 부모 컴포넌트로 삭제 요청 */}
      <button onClick={() => onDeleteSubtask(subtask.id)}>삭제</button>

      {/* 수정 폼 모달 (조건부 렌더링) */}
      {showEditForm && (
        <EditSubtaskForm
          subtask={subtask}                  // 현재 하위 작업 데이터 전달
          onSubmit={onEditSubtask}           // 수정 완료 시 부모 함수 실행
          onClose={() => setShowEditForm(false)} // 닫기 버튼 클릭 시 숨김
        />
      )}
    </div>
  );
}

export default Subtask;