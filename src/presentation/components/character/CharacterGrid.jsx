import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CharacterGrid.css";
import CharacterDisplay from "./CharacterDisplay";
import { saveUserCharacterData, getUserCharacterData, initializeUserCharacterData } from "../../../services/characters";
import { subscribeAuth } from  "../../../services/auth"
import Sidebar from "../sidebar/Sidebar";

function CharacterGrid({ characters, onSelect }) {
  const navigate = useNavigate();
    
  // 사용자 인증 상태
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 보유 돈 상태 (A, B, C, D)
  const [userMoney, setUserMoney] = useState({
    A: 3, // 기본값
    B: 2,
    C: 1,
    D: 1
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

  // 해금 조건을 만족하는지 확인하는 함수
  const canUnlock = useCallback((character) => {
    const { unlockCost } = character;
    return (
      userMoney.A >= unlockCost.A &&
      userMoney.B >= unlockCost.B &&
      userMoney.C >= unlockCost.C &&
      userMoney.D >= unlockCost.D
    );
  }, [userMoney]);

  // 사용자 인증 상태 감지
  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setUser(user);
      if (user) {
        // 로그인된 경우 파이어베이스에서 데이터 불러오기
        try {
          const characterData = await getUserCharacterData(user.uid);
          if (characterData) {
            setUserMoney(characterData.userMoney);
            setUnlockedCharacters(characterData.unlockedCharacters);
            setNickname(characterData.nickname);
            setSelectedCharacter(characterData.selectedCharacter);
          } else {
            // 첫 로그인인 경우 초기 데이터 설정
            const initialData = await initializeUserCharacterData(user.uid, characters);
            setUserMoney(initialData.userMoney);
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
        const savedMoney = localStorage.getItem('userMoney');
        const savedCharacters = localStorage.getItem('unlockedCharacters');
        const savedNickname = localStorage.getItem('userNickname');
        const savedSelected = localStorage.getItem('selectedCharacter');
        
        if (savedMoney) setUserMoney(JSON.parse(savedMoney));
        if (savedCharacters) setUnlockedCharacters(JSON.parse(savedCharacters));
        if (savedNickname) setNickname(savedNickname);
        if (savedSelected) setSelectedCharacter(JSON.parse(savedSelected));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [characters]);

  // 사용자 데이터 변경 시 파이어베이스에 저장
  useEffect(() => {
    if (user && !isLoading) {
      const characterData = {
        selectedCharacter,
        unlockedCharacters,
        userMoney,
        nickname
      };
      saveUserCharacterData(user.uid, characterData).catch(error => {
        console.error('Error saving character data:', error);
      });
    }
  }, [user, selectedCharacter, unlockedCharacters, userMoney, nickname, isLoading]);

  // 자동 해금 체크 및 업데이트
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
  }, [userMoney, canUnlock]);

  // 캐릭터 선택 함수
  const handleCharacterSelect = (character) => {
    if (character.unlocked) {
      setSelectedCharacter(character);
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('selectedCharacter', JSON.stringify(character));
      onSelect(character);
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
  const saveNickname = () => {
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim());
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('userNickname', tempNickname.trim());
      setIsEditingNickname(false);
      setTempNickname('');
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
      
      <div className="backRectangle">
        {/* 선택된 캐릭터 이미지 표시 */}
        <div className="character-user-box">
          <CharacterDisplay character={selectedCharacter || unlockedCharacters.find(char => char.unlocked)} />
        </div>
      
        {/* 사용자 보유 돈 표시 */}
        <div className="money-display">
          <div>A: {userMoney.A}</div>
          <div>B: {userMoney.B}</div>
          <div>C: {userMoney.C}</div>
          <div>D: {userMoney.D}</div>
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
              {!character.unlocked && (
                <div className="unlock-cost">
                  {Object.entries(character.unlockCost).map(([type, cost]) => 
                    cost > 0 && (
                      <span key={type} className={`cost-item ${type.toLowerCase()}`}>
                        {type}: {cost}
                      </span>
                    )
                  )}
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
    </div>
  );
}

export default CharacterGrid;