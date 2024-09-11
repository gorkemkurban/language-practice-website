import React, { useState, useEffect, useRef } from 'react';
import './chatPage.css';
import { Link, useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('');
  const [character, setCharacter] = useState('');
  const [botTypingMessage, setBotTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const location = useLocation();
  const messagesEndRef = useRef(null); // Mesaj kutusuna referans

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setLanguage(queryParams.get('language') || 'English');
    setCharacter(queryParams.get('character') || 'Teacher');
  }, [location.search]);

  useEffect(() => {
    // Mesaj kutusunun sonuna kaydır
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // HTML etiketlerini temizleme fonksiyonu
  const stripHtmlTags = (text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || "";
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '' || isTyping || isDisabled) return;

    setMessages((prevMessages) => [...prevMessages, { text: inputValue, type: 'user' }]);
    setInputValue('');
    setIsDisabled(true);

    try {
      // API'ye istek gönder
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputValue,
          language: language,
          character: character,
        }),
      });

      if (!response.ok) throw new Error('Bir hata oluştu.');

      const data = await response.json();

      displayBotMessage(data.text);
    } catch (error) {
      console.error('API Hatası:', error);
    }
  };

  const displayBotMessage = (message) => {
    setIsTyping(true);
    setBotTypingMessage('');

    const cleanMessage = stripHtmlTags(message); // HTML etiketlerini temizle

    let index = 0;
    setBotTypingMessage(cleanMessage[index]);
    index++;

    const interval = setInterval(() => {
      if (index < cleanMessage.length) {
        setBotTypingMessage((prev) => prev + cleanMessage[index]);
        index++;
      } else {
        clearInterval(interval);
        setMessages((prevMessages) => [...prevMessages, { text: cleanMessage, type: 'bot' }]);
        setIsTyping(false);
        setIsDisabled(false);
      }
    }, 15);
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
        {isTyping && (
          <div className="bot-message">
            {botTypingMessage}
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Mesaj kutusunun sonuna referans */}
      </div>
      <div className={`chatbot-input-container ${isDisabled ? 'disabled' : ''}`}>
        <input
          type="text"
          className="chatbot-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type Here..."
          disabled={isDisabled}
        />
        <button className="microphone-button" disabled={isDisabled}>
          <i className="fas fa-microphone"></i>
        </button>
        <button
          className={`send-button ${inputValue.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          disabled={!inputValue.trim() || isDisabled}
        >
          <i className="fa-solid fa-caret-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
