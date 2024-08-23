// src/components/Chatbot.js
import React, { useState } from 'react';
import './chatPage.css'; // CSS dosyasını import edin
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

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
          instructionKey: 'instruction_english',
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
        <h2 className="chatbot-title">English Teacher</h2>
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
        <button
          className={`send-button ${inputValue.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          disabled={!inputValue.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
