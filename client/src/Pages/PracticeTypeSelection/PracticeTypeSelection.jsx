import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PracticeTypeSelection.css';

const PracticeTypeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const language = queryParams.get('language');

  const handlePracticeTypeSelection = (type) => {
    if (type === 'Speech') {
      navigate(`/speech?language=${language}`);
    } else if (type === 'Chat') {
      navigate(`/character-selection?language=${language}`);
    }
  };

  return (
    <div className="practice-type-selection-container">
      <h2 className="header-color">Select Practice Type</h2>
      <div className="practice-type-buttons">
        <button onClick={() => handlePracticeTypeSelection('Speech')}>Speech</button>
        <button onClick={() => handlePracticeTypeSelection('Chat')}>Chat</button>
      </div>
    </div>
  );
};

export default PracticeTypeSelection;
