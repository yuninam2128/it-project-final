// ProjectExample.js
// 이 컴포넌트는 프로젝트 목록을 보여주고, 프로젝트 생성/수정/삭제 기능을 예시로 제공합니다.

import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects'; // 프로젝트 관련 커스텀 훅 import
import { DIContainer } from '../../../infrastructure/container/DIContainer'; // DI 컨테이너 import
import { CreateProjectDTO, UpdateProjectDTO } from '../../../application/dto/ProjectDTO'; // DTO import

const ProjectExample = () => {
  // DI 컨테이너에서 프로젝트 서비스 인스턴스 가져오기
  const projectApplicationService = DIContainer.getProjectApplicationService();

  // 프로젝트 목록, 위치, 로딩/에러 상태, CRUD 함수들을 커스텀 훅에서 가져옴
  const {
    projects,
    positions,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject
  } = useProjects(projectApplicationService);

  // 프로젝트 생성 폼 입력값 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  // 프로젝트 생성 핸들러
  const handleCreateProject = async (e) => {
    e.preventDefault(); // 폼 기본 동작 방지
    try {
      // 입력값을 DTO로 변환
      const createProjectDTO = CreateProjectDTO.fromRequest(formData);
      // 프로젝트 생성 함수 호출
      await createProject(createProjectDTO);
      // 폼 초기화
      setFormData({ title: '', description: '', priority: 'medium', deadline: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // 프로젝트 수정 핸들러(예: 진행도 증가)
  const handleUpdateProject = async (projectId, updates) => {
    try {
      // 수정값을 DTO로 변환
      const updateProjectDTO = UpdateProjectDTO.fromRequest(updates);
      // 프로젝트 수정 함수 호출
      await updateProject(projectId, updateProjectDTO);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  // 프로젝트 삭제 핸들러
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // 로딩 중이면 로딩 메시지 표시
  if (loading) return <div>Loading...</div>;
  // 에러 발생 시 에러 메시지 표시
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Projects</h2>
      
      {/* 프로젝트 생성 폼 */}
      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="Project Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <select
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
        />
        <button type="submit">Create Project</button>
      </form>

      {/* 프로젝트 목록 표시 */}
      <div>
        {projects.map(project => (
          <div key={project.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p>Priority: {project.priority}</p>
            <p>Progress: {project.progress}%</p>
            {/* 마감일이 있으면 날짜 표시 */}
            {project.deadline && <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
            
            {/* 진행도 증가 버튼 */}
            <button onClick={() => handleUpdateProject(project.id, { progress: project.progress + 10 })}>
              Increase Progress
            </button>
            {/* 삭제 버튼 */}
            <button onClick={() => handleDeleteProject(project.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectExample; //