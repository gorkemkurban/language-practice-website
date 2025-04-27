import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './speechPage.css';

const MAX_SPEECH_DURATION = 30000;

// Language level topics
const TOPICS = {
  A1: [
    "Introductions and greetings",
    "Daily routines",
    "Family members",
    "Shopping for food",
    "Asking for directions",
    "Hobbies and interests",
    "Weather and seasons",
    "Simple travel situations",
    "Ordering in a restaurant",
    "Telling time and dates"
  ],
  A2: [
    "Describing past events",
    "Making future plans",
    "Describing people and places",
    "Health and illness",
    "Holidays and travel experiences",
    "Shopping for clothes",
    "Transportation",
    "Phone conversations",
    "Work and jobs",
    "Making appointments"
  ],
  B1: [
    "Environmental issues",
    "Education systems",
    "Technology in daily life",
    "Cultural differences",
    "Social media",
    "Current affairs",
    "Personal experiences",
    "Entertainment and media",
    "Urban and rural life",
    "Health and fitness"
  ],
  B2: [
    "Global economic issues",
    "Political systems and debates",
    "Scientific advancements",
    "Art and cultural expressions",
    "Professional development",
    "Legal and ethical dilemmas",
    "Mental health awareness",
    "Literary analysis",
    "Technological innovations",
    "Environmental sustainability"
  ]
};

const LEVEL_DESCRIPTIONS = {
  A1: "Basic (9th Class)",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate"
};

const SpeechPage = () => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [language, setLanguage] = useState('');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [isMounted, setIsMounted] = useState(false);
  const [conversationType, setConversationType] = useState(null);
  const [languageLevel, setLanguageLevel] = useState(null);
  const [showMicInterface, setShowMicInterface] = useState(false);

  const recognitionRef = useRef(null);
  const speakingTimeoutRef = useRef(null);
  const location = useLocation();

  // Get Gemini response - defined early to avoid reference issues
  const getGeminiResponse = async (userInputText) => {
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,
        character: 'Teacher',
        prompt: userInputText,
        conversationType: conversationType,
        languageLevel: languageLevel
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorData}`);
    }
    const data = await response.json();
    return data.text || "Sorry, I couldn't generate a response.";
  };

  // Speak response - defined early to avoid reference issues
  const speakResponse = (responseText) => {
    if (!('speechSynthesis' in window) || !responseText) {
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.lang = languageCode;

    const clearSpeakingTimeout = () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
    }

    utterance.onend = () => {
      clearSpeakingTimeout();
      if (isMounted) {
        setSpeaking(false);
      }
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error:", event.error);
      clearSpeakingTimeout();
      if (isMounted) {
        setSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);

    speakingTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        setSpeaking(false);
      }
    }, MAX_SPEECH_DURATION);
  };

  // Stop speaking function - defined early
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (isMounted) {
      setSpeaking(false);
    }
  }, [isMounted]);

  // Handle user speech - MOVED UP before being referenced in useEffect
  const handleUserSpeech = useCallback(async (text) => {
    if (!text || speaking) return;
    if (!language || !languageCode) {
      alert("Language settings missing, please refresh the page.");
      return;
    }

    setSpeaking(true);
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }

    try {
      let prompt;
      if (languageLevel) {
        // For structured language level conversations
        prompt = `Continue the ${languageLevel} level ${language} conversation. 
        The student said: "${text}". 
        Respond appropriately with language complexity suitable for ${languageLevel} level.
        ${languageLevel === 'A1' ? 'Use simple words and short sentences (max 5-6 words).' : 
         languageLevel === 'A2' ? 'Use simple but slightly longer sentences than A1 (max 8-10 words).' : 
         languageLevel === 'B1' ? 'Use moderate vocabulary and varied sentence structures.' : 
         'Use rich vocabulary and complex sentence structures appropriate for advanced learners.'}
        Ask only one question at a time. 
        Never ask what they want to practice next.
        If there's a mistake, correct it appropriately for their level.`;
      } else {
        // For free conversation
        prompt = text;
      }

      const responseText = await getGeminiResponse(prompt);
      setGeminiResponse(responseText);
      speakResponse(responseText);
    } catch (error) {
      console.error("Error getting or speaking Gemini response:", error);
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      setSpeaking(false);
    }
  }, [language, languageCode, speaking, conversationType, languageLevel]);

  // Language setup
  useEffect(() => {
    setIsMounted(true);
    const queryParams = new URLSearchParams(location.search);
    const langParam = queryParams.get('language');
    let selectedLang = 'English';
    let selectedLangCode = 'en-US';

    if (langParam) {
      if (langParam.toLowerCase() === 'french') {
        selectedLang = 'French';
        selectedLangCode = 'fr-FR';
      } else if (langParam.toLowerCase() === 'english') {
        selectedLang = 'English';
        selectedLangCode = 'en-US';
      } else {
        console.warn(`Unsupported language parameter: ${langParam}. Defaulting to English.`);
        alert(`Selected language (${langParam}) is not supported. Defaulting to English.`);
      }
    } else {
      console.log("No language parameter found. Defaulting to 'en-US'.");
      alert('No language selected, defaulting to English.');
    }

    setLanguage(selectedLang);
    setLanguageCode(selectedLangCode);

    return () => {
      setIsMounted(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [location]);

  // Speech Recognition setup
  useEffect(() => {
    if (!isMounted || !languageCode) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setListening(true); };
    recognition.onend = () => { setListening(false); };
    recognition.onerror = (event) => { 
      console.error('Speech recognition error:', event.error); 
      setListening(false); 
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      handleUserSpeech(transcript);
    };

    recognitionRef.current = recognition;
  }, [languageCode, isMounted, handleUserSpeech]);

  // Handle conversation and level selection
  const handleConversationSetup = async (type, level = null) => {
    setConversationType(type);
    setLanguageLevel(level);
    
    let initialPrompt = '';
    if (type === 'free') {
      initialPrompt = `Let's have a free conversation in ${language}. Start by greeting me.`;
    } else if (type === 'structured' && level) {
      const levelTopics = TOPICS[level];
      const randomTopic = levelTopics[Math.floor(Math.random() * levelTopics.length)];
      
      initialPrompt = `You are a ${level} level ${language} teacher. Start a conversation about ${randomTopic} with your student. 
      ${level === 'A1' ? 'Use simple words and short sentences (max 5-6 words).' : 
       level === 'A2' ? 'Use simple but slightly longer sentences than A1 (max 8-10 words).' : 
       level === 'B1' ? 'Use moderate vocabulary and varied sentence structures.' : 
       'Use rich vocabulary and complex sentence structures appropriate for advanced learners.'}
      Ask one question at a time and wait for responses.
      Never ask what they want to practice - just continue with appropriate topics yourself.
      If the student makes a mistake, correct them in a way appropriate for their level.`;
    }

    setSpeaking(true);
    try {
      const responseText = await getGeminiResponse(initialPrompt);
      setGeminiResponse(responseText);
      speakResponse(responseText);
    } catch (error) {
      console.error("Error getting or speaking Gemini response:", error);
      alert("Error getting AI response.");
      setSpeaking(false);
    }
    
    setShowMicInterface(true);
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !listening && !speaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setListening(false);
      }
    }
  };

  return (
    <div className="speech-container">
      {!conversationType ? (
        <div className="conversation-type-selector">
          <h2>Select Conversation Type</h2>
          <button 
            className="conversation-type-button" 
            onClick={() => handleConversationSetup('free')}
          >
            General Conversation (Free)
          </button>
          <div className="structured-buttons">
            <h3>Structured Practice by Level</h3>
            <button 
              className="level-button a1" 
              onClick={() => handleConversationSetup('structured', 'A1')}
            >
              A1 - {LEVEL_DESCRIPTIONS.A1}
            </button>
            <button 
              className="level-button a2" 
              onClick={() => handleConversationSetup('structured', 'A2')}
            >
              A2 - {LEVEL_DESCRIPTIONS.A2}
            </button>
            <button 
              className="level-button b1" 
              onClick={() => handleConversationSetup('structured', 'B1')}
            >
              B1 - {LEVEL_DESCRIPTIONS.B1}
            </button>
            <button 
              className="level-button b2" 
              onClick={() => handleConversationSetup('structured', 'B2')}
            >
              B2 - {LEVEL_DESCRIPTIONS.B2}
            </button>
          </div>
        </div>
      ) : showMicInterface ? (
        <>
          <div className="ai-response-container">
            <div className="ai-response-bubble">
              <p className="ai-response-text">{geminiResponse}</p>
            </div>
          </div>

          <div
            className={`mic-circle ${listening ? 'listening' : ''} ${speaking ? 'speaking' : ''}`}
            onClick={startListening}
            style={{ 
              pointerEvents: listening || speaking ? 'none' : 'auto', 
              cursor: listening || speaking ? 'not-allowed' : 'pointer' 
            }}
            title={listening ? "Listening..." : (speaking ? "AI is speaking..." : "Click to speak")}
          >
            🎤
          </div>

          {speaking && (
            <button onClick={stopSpeaking} className="stop-button">
              Stop ⏹️
            </button>
          )}

          <p className="instruction-text">
            {listening ? "Listening..." : (!speaking && "Click the microphone to speak")}
          </p>
          
          {languageLevel && (
            <div className="level-indicator">
              Current level: {languageLevel} - {LEVEL_DESCRIPTIONS[languageLevel]}
            </div>
          )}
        </>
      ) : (
        <div className="loading-interface">
          <p>Preparing your {conversationType === 'free' ? 'general' : `${languageLevel} level`} conversation...</p>
        </div>
      )}
    </div>
  );
};

export default SpeechPage;