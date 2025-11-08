import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CharacterGrid.css";
import CharacterDisplay from "./CharacterDisplay";
import { saveUserCharacterData, getUserCharacterData, initializeUserCharacterData } from "../../../services/characters";
import { subscribeAuth } from  "../../../services/auth"
import { subscribeUserCoins } from "../../../services/coins";
import Sidebar from "../sidebar/Sidebar";

function CharacterGrid({ characters, onSelect }) {
  const navigate = useNavigate();
    
  // 사용자 인증 상태
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 젤리 코인 상태 (불꽃젤리, 빛나는 젤리, 하트젤리)
  const [jellyCoins, setJellyCoins] = useState({
    fireJelly: 1000,
    lightJelly: 3000,
    heartJelly: 2000
  });

  // 캐릭터 해금 상태 관리
  const [unlockedCharacters, setUnlockedCharacters] = useState([]);

  // 닉네임 상태 관리
  const [nickname, setNickname] = useState('내이름은뿌꾸');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  // 해금 애니메이션 상태 관리
  const [unlockingCharacters, setUnlockingCharacters] = useState(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // 구매 확인 모달 상태
  const [purchaseModal, setPurchaseModal] = useState({
    isOpen: false,
    character: null
  });

  // 해금 조건을 만족하는지 확인하는 함수 (젤리 코인 기반)
  const canUnlock = useCallback((character) => {
    if (!character.price) return true; // 가격이 없으면 해금됨
    
    // 필요한 젤리 코인이 충분한지 확인
    for (const [jellyType, requiredAmount] of Object.entries(character.price)) {
      if (jellyCoins[jellyType] < requiredAmount) {
        return false;
      }
    }
    return true;
  }, [jellyCoins]);

  // 사용자 인증 상태 감지
  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setUser(user);
      if (user) {
        // 로그인된 경우 파이어베이스에서 데이터 불러오기
        try {
          const characterData = await getUserCharacterData(user.uid);
          if (characterData) {
            setUnlockedCharacters(characterData.unlockedCharacters);
            setNickname(characterData.nickname);
            setSelectedCharacter(characterData.selectedCharacter);
          } else {
            // 첫 로그인인 경우 초기 데이터 설정
            const initialData = await initializeUserCharacterData(user.uid, characters);
            setUnlockedCharacters(initialData.unlockedCharacters);
            setNickname(initialData.nickname);
            setSelectedCharacter(initialData.selectedCharacter);
          }
        } catch (error) {
          console.error('Error loading character data:', error);
          // 에러 시 기본값으로 초기화
          setUnlockedCharacters(characters.map(char => ({ ...char, unlocked: char.unlocked })));
        }
      } else {
        // 로그아웃된 경우 로컬 스토리지에서 불러오기 (오프라인 모드)
        const savedCharacters = localStorage.getItem('unlockedCharacters');
        const savedNickname = localStorage.getItem('userNickname');
        const savedSelected = localStorage.getItem('selectedCharacter');
        
        if (savedCharacters) setUnlockedCharacters(JSON.parse(savedCharacters));
        if (savedNickname) setNickname(savedNickname);
        if (savedSelected) setSelectedCharacter(JSON.parse(savedSelected));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [characters]);

  // 젤리 코인 실시간 구독
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserCoins(user.uid, (coins) => {
      setJellyCoins({
        fireJelly: coins.fireJelly || 1000,
        lightJelly: coins.lightJelly || 3000,
        heartJelly: coins.heartJelly || 2000
      });
    });

    return () => unsubscribe();
  }, [user]);

  // 사용자 데이터 변경 시 파이어베이스에 저장
  useEffect(() => {
    if (user && !isLoading) {
      const characterData = {
        selectedCharacter,
        unlockedCharacters,
        // userMoney 제거됨
        nickname
      };
      saveUserCharacterData(user.uid, characterData).catch(error => {
        console.error('Error saving character data:', error);
      });
    }
  }, [user, selectedCharacter, unlockedCharacters, nickname, isLoading]);

  // 자동 해금 체크 및 업데이트 (임시 코인 로직 제거됨)
  useEffect(() => {
    setUnlockedCharacters(prevCharacters => 
      prevCharacters.map(character => {
        if (!character.unlocked && canUnlock(character)) {
          // 해금 애니메이션 시작
          setUnlockingCharacters(prev => new Set([...prev, character.id]));
          
          // 2초 후 애니메이션 완료
          setTimeout(() => {
            setUnlockingCharacters(prev => {
              const newSet = new Set(prev);
              newSet.delete(character.id);
              return newSet;
            });
          }, 2000);
          
          return { ...character, unlocked: true };
        }
        return character;
      })
    );
  }, [canUnlock]);

  // 캐릭터 선택 함수
  const handleCharacterSelect = async (character) => {
    if (character.unlocked) {
      setSelectedCharacter(character);
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('selectedCharacter', JSON.stringify(character));
      onSelect(character);

      // 파이어베이스에 선택된 캐릭터 저장
      if (user) {
        try {
          const characterData = {
            selectedCharacter: character,
            unlockedCharacters,
            nickname
          };
          await saveUserCharacterData(user.uid, characterData);
        } catch (error) {
          console.error('Error saving selected character:', error);
        }
      }
    } else {
      // 잠금된 캐릭터 클릭 시 구매 모달 열기
      setPurchaseModal({
        isOpen: true,
        character: character
      });
    }
  };

  // 구매 모달 닫기
  const closePurchaseModal = () => {
    setPurchaseModal({
      isOpen: false,
      character: null
    });
  };

  // 캐릭터 구매 처리
  const handlePurchase = async () => {
    const character = purchaseModal.character;
    if (!character || !canUnlock(character)) {
      alert('코인이 부족합니다!');
      return;
    }

    try {
      // 코인 차감
      const newCoins = { ...jellyCoins };
      for (const [jellyType, cost] of Object.entries(character.price)) {
        newCoins[jellyType] -= cost;
      }

      // 파이어베이스에 코인 업데이트
      if (user) {
        const { setUserCoins } = await import('../../../services/coins');
        await setUserCoins(user.uid, newCoins);
      }

      // 캐릭터 해금
      const updatedCharacters = unlockedCharacters.map(char => 
        char.id === character.id ? { ...char, unlocked: true } : char
      );
      setUnlockedCharacters(updatedCharacters);

      // 파이어베이스에 캐릭터 데이터 저장
      if (user) {
        const characterData = {
          selectedCharacter,
          unlockedCharacters: updatedCharacters,
          nickname
        };
        await saveUserCharacterData(user.uid, characterData);
      }

      // 해금 애니메이션
      setUnlockingCharacters(prev => new Set([...prev, character.id]));
      setTimeout(() => {
        setUnlockingCharacters(prev => {
          const newSet = new Set(prev);
          newSet.delete(character.id);
          return newSet;
        });
      }, 2000);

      // 모달 닫기
      closePurchaseModal();
      
      alert(`${character.name}을(를) 구매했습니다!`);
    } catch (error) {
      console.error('구매 중 오류 발생:', error);
      alert('구매 중 오류가 발생했습니다.');
    }
  };


  // 닉네임 편집 시작
  const startEditingNickname = () => {
    setTempNickname(nickname);
    setIsEditingNickname(true);
  };

  // 닉네임 편집 취소
  const cancelEditingNickname = () => {
    setTempNickname('');
    setIsEditingNickname(false);
  };

  // 닉네임 저장
  const saveNickname = async () => {
    if (tempNickname.trim()) {
      const newNickname = tempNickname.trim();
      setNickname(newNickname);
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('userNickname', newNickname);
      setIsEditingNickname(false);
      setTempNickname('');

      // 파이어베이스에 닉네임 저장
      if (user) {
        try {
          const characterData = {
            selectedCharacter,
            unlockedCharacters,
            nickname: newNickname
          };
          await saveUserCharacterData(user.uid, characterData);
        } catch (error) {
          console.error('Error saving nickname:', error);
        }
      }
    }
  };

  // 엔터키로 닉네임 저장
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveNickname();
    } else if (e.key === 'Escape') {
      cancelEditingNickname();
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="backgroundColor">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          캐릭터 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="backgroundColor">
      {/* 사이드바 */}
      <div className="side-bar">
        <Sidebar />
      </div>
      
      {/* 젤리 코인 헤더 */}
      <div className="store-header">
        <div className="header">
          <div className="right-header">
            <button className="header__button header__button--right">
              <img src="/images/fire-jelly.svg" alt="불꽃젤리" className="fire-jelly" />
              <span className="tooltip">{jellyCoins.fireJelly}</span>
            </button>
            <button className="header__button header__button--right">
              <img src="/images/light-jelly.svg" alt="빛나는 젤리" className="fire-jelly" />
              <span className="tooltip">{jellyCoins.lightJelly}</span>
            </button>
            <button className="header__button header__button--right">
              <img src="/images/heart-jelly.svg" alt="하트젤리" className="fire-jelly" />
              <span className="tooltip">{jellyCoins.heartJelly}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="backRectangle">
        {/* 선택된 캐릭터 이미지 표시 */}
        <div className="character-user-box">
          <CharacterDisplay character={selectedCharacter || unlockedCharacters.find(char => char.unlocked)} />
        </div>
      

        <div className="character-grid">
          {unlockedCharacters.map((character) => (
            <div
              key={character.id}
              className={`character-box ${!character.unlocked ? "LockBox" : "UnlockBox"} ${
                unlockingCharacters.has(character.id) ? "unlocking" : ""
              } ${selectedCharacter?.id === character.id ? "selected" : ""}`}
              onClick={() => handleCharacterSelect(character)}
            >
              <img src={character.image} alt={character.name} className="character-image" />
              <div className="character-name">{character.name}</div>
              {/* 젤리 코인 가격 표시 */}
              {!character.unlocked && character.price && (
                <div className="unlock-cost">
                  {Object.entries(character.price).map(([jellyType, cost]) => (
                    <div key={jellyType} className={`cost-item ${jellyType}`}>
                      <img 
                        src={`/images/${jellyType === 'fireJelly' ? 'fire-jelly' : jellyType === 'lightJelly' ? 'light-jelly' : 'heart-jelly'}.svg`} 
                        alt={jellyType}
                        className="jelly-icon"
                      />
                      <span className="cost-amount">{cost}</span>
                    </div>
                  ))}
                </div>
              )}
              {unlockingCharacters.has(character.id) && (
                <div className="unlock-effect">
                  <div className="sparkle">✨</div>
                  <div className="sparkle">✨</div>
                  <div className="sparkle">✨</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="nameLine" />
        <div className="name-section">
          {isEditingNickname ? (
            <div className="nickname-edit">
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                onKeyDown={handleKeyPress}
                className="nickname-input"
                autoFocus
                maxLength={20}
              />
              <div className="nickname-buttons">
                <button onClick={saveNickname} className="save-btn">저장</button>
                <button onClick={cancelEditingNickname} className="cancel-btn">취소</button>
              </div>
            </div>
          ) : (
            <div className="nickname-display">
              <span className="name">{nickname}</span>
              <button onClick={startEditingNickname} className="edit-nickname-btn" title="닉네임 수정">
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 구매 확인 모달 */}
      {purchaseModal.isOpen && (
        <div className="purchase-modal-overlay">
          <div className="purchase-modal">
            <div className="purchase-modal-content">
              <h3>캐릭터를 구매하시겠습니까?</h3>
              <div className="purchase-character-info">
                <img src={purchaseModal.character.image} alt={purchaseModal.character.name} className="purchase-character-image" />
                <div className="purchase-character-details">
                  <h4>{purchaseModal.character.name}</h4>
                  <div className="purchase-price">
                    {purchaseModal.character.price && Object.entries(purchaseModal.character.price).map(([jellyType, cost]) => (
                      <div key={jellyType} className="purchase-cost-item">
                        <img 
                          src={`/images/${jellyType === 'fireJelly' ? 'fire-jelly' : jellyType === 'lightJelly' ? 'light-jelly' : 'heart-jelly'}.svg`} 
                          alt={jellyType}
                          className="purchase-jelly-icon"
                        />
                        <span className="purchase-cost-amount">{cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="purchase-modal-buttons">
                <button onClick={handlePurchase} className="purchase-yes-btn" disabled={!canUnlock(purchaseModal.character)}>
                  Yes
                </button>
                <button onClick={closePurchaseModal} className="purchase-no-btn">
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterGrid;