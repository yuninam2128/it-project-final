// Mock Projects Service - Firebase 없이 프론트엔드 개발용
// 실제 Firebase 서비스와 동일한 인터페이스 제공
/*
import { loadMockData, saveMockData } from './mockData';

let mockProjects = loadMockData();
let listeners = [];

// 실시간 구독 시뮬레이션
const notifyListeners = () => {
  const projects = [...mockProjects];
  const positions = {};

  projects.forEach(project => {
    if (project.position) {
      positions[project.id] = project.position;
    }
  });

  listeners.forEach(callback => {
    callback({ projects, positions });
  });
};

// 프로젝트 생성
export const createProject = async (projectData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject = {
        id: `project-${Date.now()}`,
        title: projectData.title,
        description: projectData.description || '',
        priority: projectData.priority || '중',
        progress: Number(projectData.progress || 0),
        deadline: projectData.deadline,
        ownerId: projectData.ownerId,
        position: projectData.position,
        subtasks: projectData.subtasks || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProjects.push(newProject);
      saveMockData(mockProjects);
      notifyListeners();

      console.log('✅ Mock: 프로젝트 생성됨:', newProject.title);
      resolve({ id: newProject.id, ...newProject });
    }, 300); // 네트워크 지연 시뮬레이션
  });
};

// 프로젝트 수정
export const updateProject = async (projectId, updates) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        mockProjects[index] = {
          ...mockProjects[index],
          ...updates,
          updatedAt: new Date()
        };
        saveMockData(mockProjects);
        notifyListeners();

        console.log('✅ Mock: 프로젝트 수정됨:', projectId);
        resolve({ id: projectId, ...mockProjects[index] });
      } else {
        resolve(null);
      }
    }, 200);
  });
};

// 프로젝트 삭제
export const deleteProject = async (projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockProjects = mockProjects.filter(p => p.id !== projectId);
      saveMockData(mockProjects);
      notifyListeners();

      console.log('✅ Mock: 프로젝트 삭제됨:', projectId);
      resolve();
    }, 200);
  });
};

// 사용자의 프로젝트 가져오기
export const getUserProjects = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projects = mockProjects.filter(p => !userId || p.ownerId === userId);
      const positions = {};

      projects.forEach(project => {
        if (project.position) {
          positions[project.id] = project.position;
        }
      });

      console.log('✅ Mock: 프로젝트 조회됨:', projects.length, '개');
      resolve({ projects, positions });
    }, 300);
  });
};

// 단일 프로젝트 가져오기
export const getProject = async (projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      console.log('✅ Mock: 프로젝트 조회:', projectId);
      resolve(project || null);
    }, 200);
  });
};

// 프로젝트 위치 업데이트
export const updateProjectPosition = async (projectId, position) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        mockProjects[index].position = {
          x: position.x,
          y: position.y,
          radius: position.radius
        };
        mockProjects[index].updatedAt = new Date();
        saveMockData(mockProjects);
        notifyListeners();

        console.log('✅ Mock: 프로젝트 위치 업데이트:', projectId);
      }
      resolve();
    }, 100);
  });
};

// 여러 프로젝트 위치 업데이트
export const updateMultipleProjectPositions = async (positions) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.entries(positions).forEach(([projectId, position]) => {
        const index = mockProjects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          mockProjects[index].position = position;
          mockProjects[index].updatedAt = new Date();
        }
      });
      saveMockData(mockProjects);
      notifyListeners();

      console.log('✅ Mock: 여러 프로젝트 위치 업데이트');
      resolve();
    }, 150);
  });
};

// 실시간 구독 (Firebase onSnapshot 시뮬레이션)
export const subscribeToUserProjects = (userId, callback) => {
  console.log('✅ Mock: 프로젝트 실시간 구독 시작:', userId);

  listeners.push(callback);

  // 초기 데이터 전달
  setTimeout(() => {
    const projects = mockProjects.filter(p => !userId || p.ownerId === userId);
    const positions = {};

    projects.forEach(project => {
      if (project.position) {
        positions[project.id] = project.position;
      }
    });

    callback({ projects, positions });
  }, 100);

  // 구독 해제 함수 반환
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
    console.log('✅ Mock: 프로젝트 구독 해제');
  };
};

// 단일 프로젝트 구독
export const subscribeToProject = (projectId, callback) => {
  console.log('✅ Mock: 단일 프로젝트 구독 시작:', projectId);

  const listener = ({ projects }) => {
    const project = projects.find(p => p.id === projectId);
    callback(project || null);
  };

  listeners.push(listener);

  // 초기 데이터 전달
  setTimeout(() => {
    const project = mockProjects.find(p => p.id === projectId);
    callback(project || null);
  }, 100);

  // 구독 해제 함수
  return () => {
    listeners = listeners.filter(cb => cb !== listener);
    console.log('✅ Mock: 단일 프로젝트 구독 해제');
  };
};

// Subtask 관련 함수들
export const addSubtask = async (projectId, subtask) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        project.subtasks = project.subtasks || [];
        project.subtasks.push(subtask);
        project.updatedAt = new Date();
        saveMockData(mockProjects);
        notifyListeners();

        console.log('✅ Mock: 서브태스크 추가됨:', subtask.title);
        resolve(project.subtasks);
      } else {
        resolve([]);
      }
    }, 200);
  });
};

export const updateSubtask = async (projectId, updatedSubtask) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project && project.subtasks) {
        const index = project.subtasks.findIndex(st => st.id === updatedSubtask.id);
        if (index !== -1) {
          project.subtasks[index] = updatedSubtask;
          project.updatedAt = new Date();
          saveMockData(mockProjects);
          notifyListeners();

          console.log('✅ Mock: 서브태스크 수정됨:', updatedSubtask.title);
        }
        resolve(project.subtasks);
      } else {
        resolve([]);
      }
    }, 200);
  });
};

export const deleteSubtask = async (projectId, subtaskId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project && project.subtasks) {
        project.subtasks = project.subtasks.filter(st => st.id !== subtaskId);
        project.updatedAt = new Date();
        saveMockData(mockProjects);
        notifyListeners();

        console.log('✅ Mock: 서브태스크 삭제됨:', subtaskId);
        resolve(project.subtasks);
      } else {
        resolve([]);
      }
    }, 200);
  });
};

export const updateSubtaskPosition = async (projectId, subtaskId, position) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        project.subtaskPositions = project.subtaskPositions || {};
        project.subtaskPositions[subtaskId] = position;
        project.updatedAt = new Date();
        saveMockData(mockProjects);

        console.log('✅ Mock: 서브태스크 위치 업데이트:', subtaskId);
        resolve(project.subtaskPositions);
      } else {
        resolve({});
      }
    }, 100);
  });
};

// Mock 데이터 리셋 (개발/테스트용)
export const resetMockProjects = () => {
  mockProjects = loadMockData();
  saveMockData(mockProjects);
  notifyListeners();
  console.log('✅ Mock: 데이터 초기화됨');
};
*/