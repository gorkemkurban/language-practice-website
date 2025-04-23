import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './speechPage.css';

const SpeechPage = () => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [language, setLanguage] = useState(''); // Dil bilgisi

  const recognitionRef = useRef(null);

  // URL parametrelerini almak için useLocation kullanılıyor
  const location = useLocation();

  useEffect(() => {
    // URL'den dil parametresini almak
    const queryParams = new URLSearchParams(location.search);
    const lang = queryParams.get('language');

    console.log("Dil parametresi URL'den alındı:", lang);  // URL parametresini kontrol et

    // Dil parametresini setle
    setLanguage(lang);  // Dil bilgisi state'e aktarılıyor

    // Eğer dil parametresi eksikse, varsayılan dil olarak 'en-US' kullanıyoruz
    if (!lang) {
      console.log("Dil parametresi eksik, varsayılan dil 'en-US' kullanılacak.");
      setLanguage('en-US');  // Varsayılan dil
      alert('Dil seçimi yapılmadı, varsayılan dil olarak İngilizce seçildi.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }

    const recognition = new SpeechRecognition();
    // Dil ayarlarını kontrol et ve doğru olarak ayarla
    recognition.lang = lang === 'French' ? 'fr-FR' : 'en-US';  // Default 'en-US' dilini kullan
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      handleUserSpeech(transcript);  // Kullanıcının sesli girdisini işleme
    };

    recognitionRef.current = recognition;
  }, [location]); // location değiştiğinde yeniden çalışacak

  useEffect(() => {
    if (language) {
      console.log("handleUserSpeech çağrılacak. Dil parametresi:", language);
      // Dil parametresi geldiğinde handleUserSpeech çağrılıyor
      handleUserSpeech(userInput);
    }
  }, [language, userInput]);  // language ve userInput değiştiğinde çalışacak

  const handleUserSpeech = async (text) => {
    console.log("handleUserSpeech çağrıldı. Dil parametresi:", language);

    // Dil parametresi eksikse bir hata mesajı verelim
    if (!language) {
      console.error("Dil parametresi eksik!");
      return;
    }

    setSpeaking(true); // AI yanıt veriyor, UI'yi güncelle
    const responseText = await getGeminiResponse(text);
    setGeminiResponse(responseText);  // Gelen AI cevabını state'e kaydediyoruz
    speakResponse(responseText);  // Sesli yanıt verme işlemi
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
    }
  };

  const getGeminiResponse = async (userInput) => {
    console.log("İstek gönderiliyor:", {
      language: language,
      prompt: userInput
    });
    
    // language kontrolü ekledik
    if (!language) {
      alert("Dil parametresi eksik, işlem yapılamaz!");
      return;
    }

    const response = await fetch('http://localhost:5000/generate', {  // Backend portunu değiştirdik
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,  // Dil parametresini gönderiyoruz
        character: 'Teacher', // Varsayılan karakter olarak Teacher belirledim (karakter seçimi yok)
        prompt: userInput
      }),
    });

    const data = await response.json();
    return data.text;  // Backend'den dönen yanıtı alıyoruz
  };

  // Kullanıcıya AI cevabını sesli olarak iletme
  const speakResponse = (responseText) => {
    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.lang = language === 'French' ? 'fr-FR' : 'en-US';  // Yanıt diline göre ayar
    utterance.onend = () => {
      setSpeaking(false);  // Konuşma bittiğinde speaking state'ini false yapıyoruz
      recognitionRef.current.start(); // Konuşma bitince mikrofonu yeniden başlatıyoruz
    };
    window.speechSynthesis.speak(utterance);  // Yanıtı sesli okuma
  };

  return (
    <div className="speech-container">
      <div
        className={`mic-circle ${listening ? 'listening' : ''} ${speaking ? 'speaking' : ''}`}
        onClick={startListening}
        style={{ pointerEvents: speaking ? 'none' : 'auto' }} // speaking durumunda butonu pasif hale getirdik
      >
        🎤
      </div>
      <p className="instruction-text">
        {speaking ? 'Listen...' : 'You can talk'} {/* Burada metni güncelliyoruz */}
      </p>
      {/* Ekranda kullanıcı girdiği ve AI cevabını gösteren kısımlar kaldırıldı */}
      {console.log(`You said: ${userInput}`)} {/* Kullanıcının söylediği */}
      {console.log(`AI says: ${geminiResponse}`)} {/* AI'nın cevabı */}
    </div>
  );
};

export default SpeechPage;
