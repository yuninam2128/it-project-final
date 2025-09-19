// CharacterDisplay.jsx
// 이 컴포넌트는 전달받은 character 객체의 이미지를 화면에 표시하는 역할을 합니다.

import React from "react";

// CharacterDisplay 컴포넌트 정의, character prop을 받아옴
function CharacterDisplay({ character }) {
  // character가 없으면 아무것도 렌더링하지 않음
  if (!character) return null;

  return (
    <div className="character-display-inside">
      {/* character의 이미지를 표시, alt에는 캐릭터 이름을 사용 */}
      <img
        src={character.image}
        alt={character.name}
        className="character-visual-inside"
      />
    </div>
  );
}

export default CharacterDisplay; // 컴포넌트
