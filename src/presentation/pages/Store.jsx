import React, { useState } from "react";
import CharacterGrid from "../components/character/CharacterGrid";
import charactersData from "../../data/characters";

function Store() {
  const [characters, setCharacters] = useState(charactersData);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // const navigate = useNavigate();

  const handleSelect = (char) => {
    if (char.unlocked) setSelectedCharacter(char);
  };

  const handleUnlock = (id) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unlocked: true } : c))
    );
  };

  return (
    <div className="app">
        <CharacterGrid
        characters={characters}
        onSelect={handleSelect}
        onUnlock={handleUnlock}
        selectedCharacter={selectedCharacter} // ✅ 전달
      />
    </div>
  );
}

export default Store;
