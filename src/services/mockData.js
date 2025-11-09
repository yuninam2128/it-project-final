// Mock 데이터 - Firebase 연결 없이 프론트엔드 개발용
/*
// 샘플 사용자 데이터
export const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: '남지윤',
  photoURL: null
};

// 샘플 프로젝트 데이터
export const mockProjects = [
  {
    id: 'project-1',
    title: '웹 개발 프로젝트',
    description: 'React로 포트폴리오 웹사이트 만들기',
    priority: '상',
    progress: 65,
    deadline: new Date('2025-11-15'),
    ownerId: 'mock-user-123',
    position: { x: 400, y: 250, radius: 75 },
    subtasks: [
      {
        id: 'subtask-1-1',
        title: 'UI 디자인',
        priority: '상',
        progress: 80,
        deadline: new Date('2025-11-05'),
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-11-05'),
        todos: {
          '2025-10-20': [
            {
              id: 'todo-1-1-1',
              text: '와이어프레임 작성',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-20')
            }
          ],
          '2025-10-21': [
            {
              id: 'todo-1-1-2',
              text: '컬러 팔레트 선정',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-21')
            }
          ],
          '2025-10-22': [
            {
              id: 'todo-1-1-3',
              text: 'Figma 디자인 완성',
              progress: 0,
              completed: false,
              createdAt: new Date('2025-10-22')
            }
          ]
        }
      },
      {
        id: 'subtask-1-2',
        title: '프론트엔드 개발',
        priority: '상',
        progress: 50,
        deadline: new Date('2025-11-10'),
        startDate: new Date('2025-10-23'),
        endDate: new Date('2025-11-10'),
        todos: {
          '2025-10-23': [
            {
              id: 'todo-1-2-1',
              text: 'React 프로젝트 세팅',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-23')
            }
          ],
          '2025-10-24': [
            {
              id: 'todo-1-2-2',
              text: '메인 페이지 구현',
              progress: 0,
              completed: false,
              createdAt: new Date('2025-10-24')
            }
          ]
        }
      },
      {
        id: 'subtask-1-3',
        title: '백엔드 API',
        priority: '중',
        progress: 30,
        deadline: new Date('2025-11-12'),
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-11-12'),
        todos: []
      }
    ],
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-28')
  },
  {
    id: 'project-2',
    title: '알고리즘 스터디',
    description: '코딩 테스트 대비 알고리즘 문제 풀이',
    priority: '중',
    progress: 45,
    deadline: new Date('2025-12-01'),
    ownerId: 'mock-user-123',
    position: { x: 650, y: 400, radius: 55 },
    subtasks: [
      {
        id: 'subtask-2-1',
        title: '자료구조 복습',
        priority: '중',
        progress: 60,
        deadline: new Date('2025-11-20'),
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-11-20'),
        todos: {
          '2025-10-25': [
            {
              id: 'todo-2-1-1',
              text: '스택/큐 문제 10개',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-25')
            }
          ],
          '2025-10-26': [
            {
              id: 'todo-2-1-2',
              text: '트리 순회 문제 5개',
              progress: 0,
              completed: false,
              createdAt: new Date('2025-10-26')
            }
          ]
        }
      },
      {
        id: 'subtask-2-2',
        title: 'DP 문제 풀이',
        priority: '하',
        progress: 20,
        deadline: new Date('2025-11-25'),
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-25'),
        todos: []
      }
    ],
    createdAt: new Date('2025-10-18'),
    updatedAt: new Date('2025-10-27')
  },
  {
    id: 'project-3',
    title: '영어 회화 학습',
    description: '매일 30분 영어 회화 연습',
    priority: '하',
    progress: 70,
    deadline: new Date('2025-12-31'),
    ownerId: 'mock-user-123',
    position: { x: 250, y: 450, radius: 40 },
    subtasks: [
      {
        id: 'subtask-3-1',
        title: '일상 회화 표현',
        priority: '하',
        progress: 80,
        deadline: new Date('2025-11-30'),
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-11-30'),
        todos: {
          '2025-10-20': [
            {
              id: 'todo-3-1-1',
              text: '인사 표현 암기',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-20')
            }
          ],
          '2025-10-22': [
            {
              id: 'todo-3-1-2',
              text: '날씨 관련 대화 연습',
              progress: 100,
              completed: true,
              createdAt: new Date('2025-10-22')
            }
          ]
        }
      }
    ],
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-29')
  }
];

// 로컬 스토리지 키
const STORAGE_KEY = 'mock-projects-data';
const USER_STORAGE_KEY = 'mock-user-data';

// 로컬 스토리지에서 데이터 로드
export const loadMockData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Date 객체로 변환
      return parsed.map(project => ({
        ...project,
        deadline: new Date(project.deadline),
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        subtasks: project.subtasks.map(subtask => ({
          ...subtask,
          deadline: new Date(subtask.deadline),
          startDate: subtask.startDate ? new Date(subtask.startDate) : null,
          endDate: subtask.endDate ? new Date(subtask.endDate) : null,
          todos: subtask.todos || []
        }))
      }));
    }
    return mockProjects;
  } catch (error) {
    console.error('Mock 데이터 로드 실패:', error);
    return mockProjects;
  }
};

// 로컬 스토리지에 데이터 저장
export const saveMockData = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Mock 데이터 저장 실패:', error);
  }
};

// 사용자 데이터 로드
export const loadMockUser = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return mockUser;
  } catch (error) {
    console.error('Mock 사용자 로드 실패:', error);
    return mockUser;
  }
};

// 사용자 데이터 저장
export const saveMockUser = (user) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Mock 사용자 저장 실패:', error);
  }
};

// Mock 데이터 초기화
export const resetMockData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  return mockProjects;
};
*/