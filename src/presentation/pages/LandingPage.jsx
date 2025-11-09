import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="Background"> {/* 배경 클래스 적용 */}
      <header className="barheader">
        
        <div className="price">
          <Link to="/login" className="logintext">로그인</Link>
        </div>

        {/* 회원가입 버튼 */}
        <Link to="/signup" className="signuptext">
          회원가입
        </Link> 
      </header>

      <div className="main">
        <div className="landing-title">
          <h1 className="title-message">장기 프로젝트를 달성하며 정복하는 당신의 우주</h1>
          <img src="/images/cosmove-text.png" alt="cosmove-text" className="text-logo"/>
        </div>

        <img src="/images/pj-high.png" alt="landing-circle" className="landing-circle" />

        <Link to="/signup" className="signupbutton">
          회원가입
        </Link>

        <div className="explain">
          <div className="first-ex">
            <img src="/images/landing-shine.png" alt="shine" className="shine"/>
            <div className="first-ex-text">
              <h1>마인드맵을 통한</h1>
              <h1>비선형적 프로젝트 관리</h1>
            </div>
          </div>

          <div className="second-ex">
            <img src="/images/landing-shine.png" alt="shine" className="shine"/>
            <div className="second-ex-text">
              <h1>단계별로 성취하는</h1>
              <h1>투두리스트</h1>
            </div>
          </div>

          <div className="third-ex">
            <img src="/images/landing-shine.png" alt="shine" className="shine"/>
            <div className="third-ex-text">
              <h1>쉽고 재미있는</h1>
              <h1>목표 달성</h1>
            </div>
          </div>
        </div>

        <h1 className="plan-title">가격 플랜</h1>

        <div className="plan">
          <div className="plan-free">
            <h1 className="free-title">Free</h1>
            <h1 className="plan-price">₩0 | Month</h1>
            <button className="plan-button">시작하기</button>
            <div className="plan-explain">
              <img src="/images/check.png" alt="check" className="check"/>
              <h1 className="explain-text">생성 가능한 프로젝트 개수 3개</h1>
            </div>
            <div className="plan-explain">
              <img src="/images/check.png" alt="check" className="check"/>
              <h1 className="explain-text">광고 시청 필수</h1>
            </div>
          </div>

          <div className="plan-pro">
            <h1 className="free-title">Pro</h1>
            <h1 className="plan-price">₩1,000 | Month</h1>
            <button className="plan-button">시작하기</button>
            <div className="plan-explain">
              <img src="/images/check.png" alt="check" className="check"/>
              <h1 className="explain-text">생성 가능한 프로젝트 개수 무제한</h1>
            </div>
            <div className="plan-explain">
              <img src="/images/check.png" alt="check" className="check"/>
              <h1 className="explain-text">광고 제거</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;