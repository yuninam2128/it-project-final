// Firebase 연결 테스트 스크립트
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔍 Firebase 연결 테스트 시작...');

  try {
    // 1. Firebase 초기화 확인
    console.log('✅ Firebase app 초기화 완료');
    console.log('- Auth:', auth ? '연결됨' : '연결 안됨');
    console.log('- Firestore:', db ? '연결됨' : '연결 안됨');

    // 2. 인증 상태 확인
    const currentUser = auth.currentUser;
    console.log('👤 현재 사용자:', currentUser ? currentUser.email : '로그인 안됨');

    if (!currentUser) {
      console.warn('⚠️ 로그인이 필요합니다.');
      return { success: false, error: 'Not authenticated' };
    }

    // 3. Firestore 읽기 테스트
    console.log('📖 Firestore 읽기 테스트 중...');
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);

    console.log('✅ Firestore 연결 성공!');
    console.log(`📊 전체 프로젝트 수: ${snapshot.size}개`);

    // 4. 사용자 프로젝트 필터링
    let userProjects = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.ownerId === currentUser.uid) {
        userProjects++;
        console.log(`  - 프로젝트: ${data.title} (ID: ${doc.id})`);
      }
    });

    console.log(`✅ 내 프로젝트 수: ${userProjects}개`);

    return {
      success: true,
      totalProjects: snapshot.size,
      userProjects: userProjects
    };

  } catch (error) {
    console.error('❌ Firebase 연결 오류:', error);
    console.error('에러 코드:', error.code);
    console.error('에러 메시지:', error.message);

    // 구체적인 에러 분석
    if (error.code === 'permission-denied') {
      console.error('🚫 권한 거부: Firestore 보안 규칙을 확인하세요');
    } else if (error.code === 'unavailable') {
      console.error('🌐 네트워크 오류: 인터넷 연결을 확인하세요');
    } else if (error.code === 'unauthenticated') {
      console.error('🔐 인증 필요: 로그인이 필요합니다');
    }

    return { success: false, error: error.message, code: error.code };
  }
};
