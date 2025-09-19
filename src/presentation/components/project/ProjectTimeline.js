// ProjectTimeline.js - 날짜 처리 디버깅 버전
// 이 컴포넌트는 프로젝트들의 시작일(createdAt)과 마감일(deadline)을 기반으로 진행률(progressRatio)을 계산하여 타임라인 형식으로 시각화한다.

// - 현재 시간을 기준으로 프로젝트 진행률을 계산
// - Firebase Timestamp 형식(createdAt, deadline)을 Date 객체로 변환
// - 디버깅을 위해 각 프로젝트의 날짜/진행률 정보를 콘솔과 화면에 표시

import React, { useState, useEffect } from "react";
import "./styles/ProjectTimeline.css";

function ProjectTimeline({ projects = [] }) {
  // 🔹 현재 시간을 저장 (진행률 계산 기준)
  const [now, setNow] = useState(new Date());

  // 🔹 1분마다 현재 시간을 갱신 (실시간 진행률 업데이트)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60); // 1분 간격
    return () => clearInterval(timer); // 컴포넌트 해제 시 타이머 정리
  }, []);

  // 🔹 Firebase Timestamp → Date 객체 변환 함수
  const convertFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firestore Timestamp 객체일 경우
        return timestamp.toDate();
      }
      if (timestamp.seconds !== undefined) {
        // Timestamp-like 객체 (seconds 필드 존재)일 경우
        return new Date(timestamp.seconds * 1000);
      }
      // 일반 Date 문자열 혹은 밀리초 값일 경우
      return new Date(timestamp);
    } catch (error) {
      console.error('Date conversion error:', error);
      return null;
    }
  };

  return (
    <div className="simple-timeline">
      {/* 기본 타임라인 선 */}
      <div className="simple-line"></div>
      
      {/* 디버깅 정보 표시 */}
      <div className="debug-info">
        <div>현재 시간: {now.toLocaleString()}</div>
        <div>프로젝트 수: {projects.length}</div>
      </div>
      
      {/* 각 프로젝트를 순회하며 타임라인에 표시 */}
      {projects.map((project, index) => {
        // createdAt, deadline을 Date 객체로 변환
        const createdDate = convertFirebaseTimestamp(project.createdAt);
        const deadlineDate = convertFirebaseTimestamp(project.deadline);
        
        // 콘솔에 디버깅 출력
        console.log(`Project ${index}:`, {
          title: project.title,
          createdAt: project.createdAt,
          deadline: project.deadline,
          createdDate: createdDate,
          deadlineDate: deadlineDate
        });

        // 🔹 진행률 계산 변수
        let progressRatio = 0;
        let errorMsg = '';
        
        if (!createdDate || !deadlineDate) {
          // 날짜가 아예 없는 경우
          errorMsg = '날짜 없음';
        } else if (isNaN(createdDate.getTime()) || isNaN(deadlineDate.getTime())) {
          // 변환 실패
          errorMsg = '잘못된 날짜';
        } else {
          // 총 기간과 경과 시간을 계산
          const totalDuration = deadlineDate - createdDate;
          const elapsed = now - createdDate;
          
          if (totalDuration <= 0) {
            // 마감일이 시작일보다 빠른 경우
            errorMsg = '마감일이 시작일보다 이전';
          } else {
            // 진행률 = (경과시간 / 총 기간), 0~1 사이로 제한
            progressRatio = Math.min(Math.max(elapsed / totalDuration, 0), 1);
          }
        }
        
        return (
          <div key={project.id || index}>
            {/* 타임라인 점 (에러 없을 경우만 표시) */}
            {!errorMsg && (
              <div 
                className="simple-dot"
                style={{
                  left: `${progressRatio * 100}%`, // 진행률에 따라 좌표 결정
                  background: progressRatio > 1 
                    ? 'red'      // 마감 초과
                    : progressRatio > 0.8 
                    ? 'orange'   // 80% 이상 경과
                    : 'green'    // 정상 진행 중
                }}
                title={`${project.title} - ${Math.round(progressRatio * 100)}%`}
              >
                {index + 1}
              </div>
            )}
            
            {/* 프로젝트 정보 박스 */}
            <div 
              style={{
                position: 'absolute',
                top: '70px',
                left: `${index * 150}px`, // 각 프로젝트를 좌우로 배치
                width: '140px',
                background: errorMsg ? '#ffebee' : '#e8f5e8',
                border: '1px solid ' + (errorMsg ? '#f44336' : '#4caf50'),
                borderRadius: '4px',
                padding: '8px',
                fontSize: '11px'
              }}
            >
              <strong>{project.title || `프로젝트 ${index + 1}`}</strong><br/>
              {errorMsg ? (
                // 날짜 오류 발생 시 에러 메시지 출력
                <span style={{color: 'red'}}>❌ {errorMsg}</span>
              ) : (
                // 정상일 경우 상세 정보 표시
                <>
                  📅 시작: {createdDate ? createdDate.toLocaleDateString() : 'N/A'}<br/>
                  🎯 마감: {deadlineDate ? deadlineDate.toLocaleDateString() : 'N/A'}<br/>
                  📊 진행률: {Math.round(progressRatio * 100)}%
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProjectTimeline;