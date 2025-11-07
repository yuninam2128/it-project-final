import "./header.css";
import React, { useState, useEffect } from "react";

function Header({ onAddClick, jellies = { fire: 0, heart: 0, light: 0 } }) {
  const [fire, setFire] = useState(jellies.fire || 0);
  const [heart, setHeart] = useState(jellies.heart || 0);
  const [light, setLight] = useState(jellies.light || 0);

  useEffect(() => {
    // jellies props가 전달되면 업데이트
    setFire(jellies.fire || 0);
    setHeart(jellies.heart || 0);
    setLight(jellies.light || 0);
  }, [jellies]);

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