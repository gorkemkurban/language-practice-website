import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CharacterSelection.css';

const CharacterSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const language = queryParams.get('language');

  const handleCharacterSelection = (character) => {
    navigate(`/chatpage?language=${language}&character=${character}`);
  };

  return (
    <div className="character-selection-container">
      <h2>Select a Character</h2>
      <button onClick={() => handleCharacterSelection('Doctor')}>Doctor</button>
      <button onClick={() => handleCharacterSelection('Teacher')}>Teacher</button>
      {/* Diğer karakterler buraya eklenebilir */}
    </div>
  );
};

export default CharacterSelection;
