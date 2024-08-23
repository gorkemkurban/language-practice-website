import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import LanguageSelection from './components/LanguageSelection/LanguageSelection';
import CharacterSelection from './components/CharacterSelection/CharacterSelection';
import Chatbot from './components/ChatPage/ChatPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/language-selection" element={<LanguageSelection />} />
        <Route path="/character-selection" element={<CharacterSelection />} />
        <Route path="/chatpage" element={<Chatbot />} />
      </Routes>
    </Router>
  );
};

export default App;
