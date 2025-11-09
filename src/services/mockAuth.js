// Mock Auth Service - Firebase 없이 프론트엔드 개발용
/*
import { loadMockUser, saveMockUser } from './mockData';

let currentUser = null;
let authListeners = [];

// 인증 상태 변경 알림
const notifyAuthListeners = (user) => {
  authListeners.forEach(callback => {
    callback(user);
  });
};

// 자동 로그인 (페이지 로드 시)
const autoLogin = () => {
  setTimeout(() => {
    currentUser = loadMockUser();
    console.log('✅ Mock: 자동 로그인됨:', currentUser.displayName);
    notifyAuthListeners(currentUser);
  }, 500); // 실제 Firebase 로딩 시뮬레이션
};

// 로그인
export const signIn = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = loadMockUser();
      currentUser.email = email;
      saveMockUser(currentUser);
      notifyAuthListeners(currentUser);

      console.log('✅ Mock: 로그인 성공:', email);
      resolve(currentUser);
    }, 800);
  });
};

// 회원가입
export const signUp = async (email, password, displayName, username) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = {
        uid: `mock-user-${Date.now()}`,
        email: email,
        displayName: displayName || 'Mock User',
        photoURL: null
      };
      saveMockUser(currentUser);
      notifyAuthListeners(currentUser);

      console.log('✅ Mock: 회원가입 성공:', displayName);
      resolve(currentUser);
    }, 1000);
  });
};

// 로그아웃
export const signOut = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      notifyAuthListeners(null);

      console.log('✅ Mock: 로그아웃됨');
      resolve();
    }, 300);
  });
};

// 현재 사용자 가져오기
export const getCurrentUser = () => {
  return currentUser;
};

// 현재 사용자 이름 가져오기
export const getCurrentUserDisplayName = () => {
  return currentUser ? currentUser.displayName : null;
};

// 인증 상태 구독 (Firebase onAuthStateChanged 시뮬레이션)
export const subscribeAuth = (callback) => {
  console.log('✅ Mock: 인증 상태 구독 시작');

  authListeners.push(callback);

  // 초기 인증 상태 전달 (자동 로그인)
  if (!currentUser) {
    autoLogin();
  } else {
    setTimeout(() => {
      callback(currentUser);
    }, 100);
  }

  // 구독 해제 함수 반환
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
    console.log('✅ Mock: 인증 구독 해제');
  };
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (displayName, photoURL) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (currentUser) {
        currentUser.displayName = displayName;
        currentUser.photoURL = photoURL;
        saveMockUser(currentUser);
        notifyAuthListeners(currentUser);

        console.log('✅ Mock: 프로필 업데이트됨:', displayName);
      }
      resolve();
    }, 500);
  });
};

// 별칭 (기존 코드 호환성)
export const signInWithEmail = signIn;
export const signUpWithEmail = signUp;
*/