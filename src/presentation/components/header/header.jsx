import "./header.css";
import React, { useState, useEffect } from "react";
import { subscribeAuth } from "../../../services/auth";
import { subscribeUserCoins } from "../../../services/coins";

function Header({ onAddClick }) {
  const [fire, setFire] = useState(1000);
  const [heart, setHeart] = useState(2000);
  const [light, setLight] = useState(3000);
  const [currentUser, setCurrentUser] = useState(null);

  // 사용자 인증 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 젤리 코인 실시간 구독
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeUserCoins(currentUser.uid, (coins) => {
      setFire(coins.fireJelly || 1000);
      setHeart(coins.heartJelly || 2000);
      setLight(coins.lightJelly || 3000);
    });

    return () => unsubscribe();
  }, [currentUser]);

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