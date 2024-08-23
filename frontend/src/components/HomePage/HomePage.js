import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const startChatting = () => {
    navigate('/language-selection');
  };

  return (
    <div className="home-container">
      <h1 className="welcome-title">Welcome to Our Language Practice App</h1>
      <p className="intro-text">Interact with our chatbot to practice your English skills. Click the button below to start chatting!</p>
      <button className="start-button" onClick={startChatting}>Start Chatting</button></div>
  );
};

export default HomePage;
