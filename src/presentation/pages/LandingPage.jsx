import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="Background"> {/* 배경 클래스 적용 */}
      <header className="barheader">
        {/* 로고 */}
        <div className="logo-container">
          <img src="/images/Logo.png" alt="CosMove Logo" className="logo" />
          <img src="/images/COSMOVE.png" alt="CosMove Text" className="logo-text" />
        </div>
        
        <div className="price">
          <span className="pricetext">가격플랜</span>
          <Link to="/login" className="logintext">로그인</Link>
        </div>

        {/* 회원가입 버튼 */}
        <Link to="/signup" className="signuptext">
          회원가입
        </Link> 
      </header>

      <main>
        <h1 className="bigtext">재밌고 직관적인<br/>장기적 프로젝트 웹</h1>
        <Link to="/signup">
          <button className="signupbutton">회원가입</button>
        </Link>
      </main>

      <section className="feature-section">
        <h2 className="text1">이러한 효과를 경험할 수 있으실 겁니다.</h2>
        <ul className="feature-list">
          <li>할 일의 시각화</li>
          <li>생산성 향상</li>
          <li>시간 관리 능력 향상</li>
        </ul>
      </section>
      
      {/* 우측 장식 구체들 */}
      <div className="decorative-spheres">
        <img src="/images/circle1.png" alt="decoration" className="sphere sphere-1" />
        <img src="/images/circle2.png" alt="decoration" className="sphere sphere-2" />
        <img src="/images/circle3.png" alt="decoration" className="sphere sphere-3" />
      </div>
    </div>
  );
}

export default LandingPage;