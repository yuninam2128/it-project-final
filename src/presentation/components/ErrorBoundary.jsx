// ErrorBoundary.jsx
// 이 컴포넌트는 자식 컴포넌트 트리에서 발생하는 JavaScript 오류를 잡아내고, 사용자에게 친절한 에러 메시지를 보여주는 역할을 합니다.

import React from 'react';

// ErrorBoundary 클래스 컴포넌트 정의
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // 에러 발생 여부와 에러 객체를 state로 관리
    this.state = { hasError: false, error: null };
  }

  // 자식 컴포넌트에서 오류가 발생하면 호출되어 state를 업데이트
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 실제로 오류가 발생했을 때 호출됨(로깅 등 부가 작업 가능)
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: 실제 로깅 서비스로 전송
    // Logger.logError(error, errorInfo);
  }

  render() {
    // 에러가 발생한 경우 사용자에게 안내 메시지와 새로고침 버튼 제공
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>문제가 발생했습니다</h2>
          <p>페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
          {/* 새로고침 버튼 */}
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            새로고침
          </button>
          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>개발자 정보</summary>
              <pre style={{ 
                backgroundColor: '#f1f3f4', 
                padding: '10px', 
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // 에러가 없으면 자식 컴포넌트 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;