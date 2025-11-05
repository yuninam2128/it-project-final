// Mock Project Repository - FirebaseProjectRepository와 동일한 인터페이스

import { loadMockData, saveMockData } from '../../services/mockData';

export class MockProjectRepository {
  constructor() {
    this.projects = loadMockData();
    this.listeners = [];
  }

  notifyListeners() {
    const projects = [...this.projects];
    const positions = {};

    projects.forEach(project => {
      if (project.position) {
        positions[project.id] = project.position;
      }
    });

    this.listeners.forEach(callback => {
      callback({ projects, positions });
    });
  }

  async create(projectData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProject = {
          id: `project-${Date.now()}`,
          ...projectData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.projects.push(newProject);
        saveMockData(this.projects);
        this.notifyListeners();

        console.log('✅ MockRepo: 프로젝트 생성됨');
        resolve(newProject);
      }, 200);
    });
  }

  async getById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = this.projects.find(p => p.id === id);
        console.log('✅ MockRepo: 프로젝트 조회:', id);
        resolve(project || null);
      }, 150);
    });
  }

  async getByUserId(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projects = this.projects.filter(p => !userId || p.ownerId === userId);
        const positions = {};

        projects.forEach(project => {
          if (project.position) {
            positions[project.id] = project.position;
          }
        });

        console.log('✅ MockRepo: 사용자 프로젝트 조회:', projects.length, '개');
        resolve({ projects, positions });
      }, 200);
    });
  }

  async update(id, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = {
            ...this.projects[index],
            ...updates,
            updatedAt: new Date()
          };
          saveMockData(this.projects);
          this.notifyListeners();

          console.log('✅ MockRepo: 프로젝트 수정됨:', id);
        }
        resolve();
      }, 150);
    });
  }

  async updatePosition(id, position) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index].position = {
            x: position.x,
            y: position.y,
            radius: position.radius
          };
          this.projects[index].updatedAt = new Date();
          saveMockData(this.projects);
          this.notifyListeners();

          console.log('✅ MockRepo: 위치 업데이트:', id);
        }
        resolve();
      }, 100);
    });
  }

  async updateMultiplePositions(positionsUpdate) {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.entries(positionsUpdate).forEach(([projectId, position]) => {
          const index = this.projects.findIndex(p => p.id === projectId);
          if (index !== -1) {
            this.projects[index].position = position;
            this.projects[index].updatedAt = new Date();
          }
        });
        saveMockData(this.projects);
        this.notifyListeners();

        console.log('✅ MockRepo: 여러 위치 업데이트');
        resolve();
      }, 150);
    });
  }

  async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.projects = this.projects.filter(p => p.id !== id);
        saveMockData(this.projects);
        this.notifyListeners();

        console.log('✅ MockRepo: 프로젝트 삭제됨:', id);
        resolve();
      }, 150);
    });
  }

  subscribeToUserProjects(userId, callback) {
    console.log('✅ MockRepo: 실시간 구독 시작:', userId);

    this.listeners.push(callback);

    // 초기 데이터 전달
    setTimeout(() => {
      const projects = this.projects.filter(p => !userId || p.ownerId === userId);
      const positions = {};

      projects.forEach(project => {
        if (project.position) {
          positions[project.id] = project.position;
        }
      });

      callback({ projects, positions });
    }, 100);

    // 구독 해제 함수
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('✅ MockRepo: 구독 해제');
    };
  }
}
