import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LanguageSelection.css';

const LanguageSelection = () => {
  const navigate = useNavigate();

  const handleLanguageSelection = (language) => {
    navigate(`/character-selection?language=${language}`);
  };

  return (
    <div className="language-selection-container">
      <h2>Select a Language</h2>
      <button onClick={() => handleLanguageSelection('English')}>English</button>
      <button onClick={() => handleLanguageSelection('French')}>French</button>
      <button onClick={() => handleLanguageSelection('Turkish')}>Turkish</button>
      {/* Diğer diller buraya eklenebilir */}
    </div>
  );
};

export default LanguageSelection;
