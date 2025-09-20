import "./header.css";
import React, { useState, useEffect } from "react";

function Header({ onAddClick }) {
  const [fire, setFire] = useState(0);
  const [heart, setHeart] = useState(0);
  const [light, setLight] = useState(0);

  useEffect(() => {
    // Firebase 흉내내기 → setTimeout으로 데이터 가져오는 것처럼
    setTimeout(() => {
      setFire(1000);
      setHeart(2000);
      setLight(3000);
    }, 1000);
  }, []);

  return (
    <div className ="header">
    <div className="left-header">
        <button className="header__button header__button--back">←</button>
        <button className="header__button header__button--add" onClick={onAddClick}>+ 프로젝트 추가</button>
      </div>
      <div className="right-header">
        <button className="header__button header__button--right">
          <img src="/images/fire-jelly.svg" alt="불꽃젤리" className="fire-jelly" />
          <span className="tooltip">{fire}</span>
        </button>
        <button className="header__button header__button--right">
          <img src="/images/light-jelly.svg" alt="빛나는 젤리" className="fire-jelly" />
          <span className="tooltip">{light}</span>
        </button>
        <button className="header__button header__button--right">
          <img src="/images/heart-jelly.svg" alt="하트젤리" className="fire-jelly" />
          <span className="tooltip">{heart}</span>
        </button>
      </div>
    </div>
  );
}

export default Header;