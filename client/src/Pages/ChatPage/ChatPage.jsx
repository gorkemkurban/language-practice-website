// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import './chatPage.css'; // CSS dosyasını import edin
import { Link, useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('');
  const [character, setCharacter] = useState('');

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setLanguage(queryParams.get('language') || 'English');
    setCharacter(queryParams.get('character') || 'Teacher');
  }, [location.search]);

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Kullanıcı mesajını ekleyin
    setMessages((prevMessages) => [...prevMessages, { text: inputValue, type: 'user' }]);
    setInputValue('');

    try {
      // API'ye istek gönder
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputValue,
          language: language, // Dil bilgisini ekleyin
          character: character, // Karakter bilgisini ekleyin
        }),
      });

      if (!response.ok) throw new Error('Bir hata oluştu.');

      const data = await response.json();
      
      // Bot yanıtını ekleyin
      setMessages((prevMessages) => [...prevMessages, { text: data.text, type: 'bot' }]);

    } catch (error) {
      console.error('API Hatası:', error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (inputValue.trim()) {
        sendMessage();
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Link to="/" className="back-button">←</Link>
        <h2 className="chatbot-title">{character}</h2>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input-container">
        <input
          type="text"
          className="chatbot-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type Here..."
        />
        <button className="microphone-button">
        <i className="fas fa-microphone"></i>
        </button>
        <button
          className={`send-button ${inputValue.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          disabled={!inputValue.trim()}
        >
          <i class="fa-solid fa-caret-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
