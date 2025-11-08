# Mock 모드 사용 가이드

Firebase 연결 없이 프론트엔드 개발을 계속할 수 있도록 Mock 데이터 시스템이 구현되었습니다.

## 🎯 Mock 모드 전환 방법 (매우 간단!)

### 방법 1: .env.local 파일 수정 (권장)

프로젝트 루트의 `.env.local` 파일을 수정하세요:

```bash
# Mock 모드 사용 (Firebase 연결 불필요)
REACT_APP_USE_MOCK=true

# Firebase 모드 사용 (Mock 모드 비활성화)
REACT_APP_USE_MOCK=false
```

**변경 후 개발 서버 재시작 필요:**
```bash
# Ctrl+C로 서버 종료 후
npm start
```

### 방법 2: 환경변수 직접 설정

```bash
# Windows (PowerShell)
$env:REACT_APP_USE_MOCK="true"; npm start

# Windows (CMD)
set REACT_APP_USE_MOCK=true && npm start

# Mac/Linux
REACT_APP_USE_MOCK=true npm start
```

## 📦 Mock 데이터 구조

### 샘플 프로젝트
Mock 모드에서는 3개의 샘플 프로젝트가 자동으로 로드됩니다:

1. **웹 개발 프로젝트** (중요도: 상)
   - UI 디자인 서브태스크 (진행도: 80%)
   - 프론트엔드 개발 서브태스크 (진행도: 50%)
   - 백엔드 API 서브태스크 (진행도: 30%)

2. **알고리즘 스터디** (중요도: 중)
   - 자료구조 복습 (진행도: 60%)
   - DP 문제 풀이 (진행도: 20%)

3. **영어 회화 학습** (중요도: 하)
   - 일상 회화 표현 (진행도: 80%)

### 샘플 사용자
- 이름: 남지윤
- 이메일: test@example.com
- UID: mock-user-123

## 🔧 주요 기능

### 자동 로그인
Mock 모드에서는 자동으로 로그인됩니다. 별도의 로그인 과정이 필요 없습니다.

### 데이터 영속성
- 모든 변경사항은 **localStorage**에 저장됩니다
- 브라우저를 새로고침해도 데이터가 유지됩니다
- 개발자 도구에서 Application → Local Storage에서 확인 가능

### 실시간 업데이트 시뮬레이션
- Firebase의 `onSnapshot`과 동일하게 작동합니다
- 프로젝트 추가/수정/삭제 시 자동으로 UI 업데이트

## 📝 사용 가능한 기능

### ✅ 지원되는 기능
- [x] 프로젝트 조회
- [x] 프로젝트 추가
- [x] 프로젝트 수정
- [x] 프로젝트 삭제
- [x] 프로젝트 위치 이동
- [x] 서브태스크 추가/수정/삭제
- [x] 실시간 구독 (onSnapshot 시뮬레이션)
- [x] 자동 로그인
- [x] 사용자 프로필 조회

### 📍 저장 위치
```
localStorage Keys:
- mock-projects-data: 프로젝트 데이터
- mock-user-data: 사용자 데이터
```

## 🔄 Mock 데이터 초기화

브라우저 콘솔에서 실행:
```javascript
// Mock 데이터 초기화 (샘플 데이터로 리셋)
localStorage.removeItem('mock-projects-data');
localStorage.removeItem('mock-user-data');
location.reload();
```

또는:
```javascript
import { resetMockData } from './src/services/mockData';
resetMockData();
```

## 🐛 디버깅

Mock 모드에서는 모든 작업이 콘솔에 로깅됩니다:

```
✅ Mock: 자동 로그인됨: 남지윤
✅ Mock: 인증 상태 구독 시작
✅ Mock: 프로젝트 실시간 구독 시작: mock-user-123
✅ Mock: 프로젝트 조회됨: 3 개
✅ Mock: 프로젝트 생성됨: 새 프로젝트
✅ Mock: 프로젝트 수정됨: project-1
✅ Mock: 프로젝트 삭제됨: project-2
```

## ⚠️ 제한사항

1. **네트워크 지연 시뮬레이션**
   - 실제 Firebase와 유사한 지연(100-800ms)을 시뮬레이션합니다
   - 실제 네트워크 오류는 발생하지 않습니다

2. **데이터 유효성 검증**
   - Firebase 보안 규칙이 적용되지 않습니다
   - 클라이언트 측 유효성 검증만 수행됩니다

3. **인증**
   - 실제 Firebase Authentication이 아닙니다
   - 이메일/비밀번호 검증이 없습니다

## 🔙 Firebase 복원

Firebase 담당자가 Firebase 문제를 해결한 후:

1. **`.env.local` 파일 수정:**
   ```bash
   REACT_APP_USE_MOCK=false
   ```

2. **개발 서버 재시작:**
   ```bash
   # Ctrl+C로 종료 후
   npm start
   ```

3. **Firebase Console에서 Firestore 규칙 확인:**
   - https://console.firebase.google.com/
   - 프로젝트 선택 → Firestore Database → Rules
   - 테스트 모드 만료 확인

**그게 끝입니다!** 코드 변경 없이 환경변수만 바꾸면 자동으로 Firebase로 전환됩니다.

## 📂 관련 파일

```
src/
├── services/
│   ├── mockData.js          # Mock 데이터 정의 및 저장/로드
│   ├── mockAuth.js          # Mock 인증 서비스
│   └── mockProjects.js      # Mock 프로젝트 서비스
├── infrastructure/repositories/
│   └── MockProjectRepository.js  # Mock Repository
└── presentation/pages/
    ├── Home.jsx             # USE_MOCK 플래그 설정
    └── Detail.jsx           # USE_MOCK 플래그 설정
```

## 💡 개발 팁

1. **새로운 샘플 데이터 추가**
   - `src/services/mockData.js`의 `mockProjects` 배열 수정

2. **네트워크 지연 조정**
   - `src/services/mockProjects.js`의 `setTimeout` 시간 변경

3. **로그 활성화/비활성화**
   - 각 Mock 서비스의 `console.log()` 주석 처리

---

**현재 상태**: Mock 모드 활성화 ✅
**Firebase 연결**: 비활성화 ⏸️
**개발 환경**: 로컬 개발 완료 가능 🎨
