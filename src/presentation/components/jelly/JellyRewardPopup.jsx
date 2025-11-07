import React, { useEffect, useState } from 'react';
import './JellyRewardPopup.css';

/**
 * 젤리 획득 팝업 컴포넌트
 * @param {array} rewards - [{ type: 'heart'|'star'|'fire', amount: number, message: string }]
 * @param {function} onClose - 팝업 닫기 콜백
 */
function JellyRewardPopup({ rewards = [], onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // rewards가 있을 때만 팝업 표시
    if (rewards && rewards.length > 0) {
      setIsVisible(true);

      // 3초 후 자동으로 팝업 닫기
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [rewards, onClose]);

  if (!isVisible || !rewards || rewards.length === 0) {
    console.log('[JellyRewardPopup] return null 조건 만족:', {
      isVisible,
      rewardsExists: !!rewards,
      rewardsLength: rewards?.length
    });
    return null;
  }

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    console.log('[JellyRewardPopup] 팝업 닫기 - 오버레이 클릭');
    setIsVisible(false);
    onClose && onClose();
  };

  // 젤리 타입별 아이콘 경로
  const jellyIcons = {
    heart: '/images/heart-jelly.svg',
    star: '/images/light-jelly.svg',
    fire: '/images/fire-jelly.svg'
  };

  // 젤리 타입별 라벨
  const jellyLabels = {
    heart: '하트젤리',
    star: '별 젤리',
    fire: '불꽃젤리'
  };

  return (
    <div className="jelly-reward-popup-overlay" onClick={handleClosePopup}>
      <div className="jelly-reward-popup" onClick={(e) => e.stopPropagation()}>
        {/* 여러 개의 젤리 보상이 있으면 각각 표시 */}
        <div className="jelly-rewards-container">
          {rewards.map((reward, index) => (
            <div key={index} className={`jelly-reward-item jelly-type-${reward.type}`}>
              <div className="jelly-icon-wrapper">
                <img
                  src={jellyIcons[reward.type]}
                  alt={jellyLabels[reward.type]}
                  className="jelly-icon"
                />
              </div>

              <div className="jelly-reward-content">
                <p className="jelly-message">{reward.message}</p>
                <p className="jelly-amount">
                  <span className="amount">+{reward.amount}</span>
                  <span className="label">{jellyLabels[reward.type]}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 여러 개일 때 총 개수 표시 */}
        {rewards.length > 1 && (
          <div className="jelly-summary">
            <p className="summary-text">총 {rewards.length}개의 젤리를 획득했습니다!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JellyRewardPopup;
