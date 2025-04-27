import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './speechPage.css';

// Konuşma için makul bir maksimum süre (milisaniye cinsinden)
// Bu süreden sonra konuşma bitmemişse bile butonu aktif hale getirir.
const MAX_SPEECH_DURATION = 30000; // 30 saniye

const SpeechPage = () => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [language, setLanguage] = useState('');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [isMounted, setIsMounted] = useState(false);

  const recognitionRef = useRef(null);
  // Konuşma zaman aşımını takip etmek için ref
  const speakingTimeoutRef = useRef(null);
  const location = useLocation();

  // --- (Dil ayarları ve Recognition useEffect kancaları öncekiyle aynı) ---
  // URL'den dil alıp state'leri ayarlayan useEffect
  useEffect(() => {
    setIsMounted(true);
    const queryParams = new URLSearchParams(location.search);
    const langParam = queryParams.get('language');
    let selectedLang = 'English';
    let selectedLangCode = 'en-US';

    console.log("URL'den alınan dil parametresi:", langParam);

    if (langParam) {
       if (langParam.toLowerCase() === 'french') {
         selectedLang = 'French';
         selectedLangCode = 'fr-FR';
       } else if (langParam.toLowerCase() === 'english') {
         selectedLang = 'English';
         selectedLangCode = 'en-US';
       } else {
          console.warn(`Desteklenmeyen dil parametresi: ${langParam}. İngilizce varsayılan olarak ayarlandı.`);
          alert(`Seçilen dil (${langParam}) desteklenmiyor. Varsayılan dil olarak İngilizce seçildi.`);
       }
    } else {
      console.log("Dil parametresi URL'de bulunamadı. Varsayılan dil 'en-US' kullanılacak.");
      alert('Dil seçimi yapılmadı, varsayılan dil olarak İngilizce seçildi.');
    }

    setLanguage(selectedLang);
    setLanguageCode(selectedLangCode);

    // Bileşen kaldırıldığında temizlik
    return () => {
      setIsMounted(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
      // Zaman aşımını temizle
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        console.log("Speaking timeout cleared on unmount.");
      }
    };
  }, [location]);

  // Speech Recognition API'sini ayarlayan useEffect
  useEffect(() => {
    if (!isMounted || !languageCode) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { console.log("Listening started..."); setListening(true); };
    recognition.onend = () => { console.log("Listening ended."); setListening(false); };
    recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); setListening(false); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcript received:", transcript);
      setUserInput(transcript);
      handleUserSpeech(transcript);
    };

    recognitionRef.current = recognition;

  }, [languageCode, isMounted]); // handleUserSpeech'i bağımlılıktan çıkardık

  // Kullanıcının konuşmasını işleyen fonksiyon (useCallback ile)
  const handleUserSpeech = useCallback(async (text) => {
    if (!text || speaking) {
      console.log("Skipping handleUserSpeech:", { text, speaking });
      return;
    }
    if (!language || !languageCode) {
      console.error("Dil bilgisi eksik! İşlem yapılamıyor.");
      alert("Dil ayarları eksik, lütfen sayfayı yenileyin.");
      return;
    }

    console.log("Handling user speech:", text, "Language:", language);
    setSpeaking(true); // AI konuşmaya BAŞLAYACAK

    // Önceki zaman aşımını temizle (nadiren gerekli ama güvenli)
    if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
    }

    try {
      const responseText = await getGeminiResponse(text);
      setGeminiResponse(responseText);
      speakResponse(responseText); // Seslendirme işlemi burada başlıyor
    } catch (error) {
      console.error("Error getting or speaking Gemini response:", error);
      alert("Yapay zekadan yanıt alınırken bir hata oluştu.");
      // Hata durumunda da zaman aşımını temizle ve butonu aktif et
       if (speakingTimeoutRef.current) {
           clearTimeout(speakingTimeoutRef.current);
       }
      setSpeaking(false);
    }
  }, [language, languageCode, speaking]); // Bağımlılıkları kontrol et

  // Dinlemeyi başlatan fonksiyon
  const startListening = () => {
    if (recognitionRef.current && !listening && !speaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setListening(false);
      }
    } else {
        console.log("Cannot start listening:", { hasRef: !!recognitionRef.current, listening, speaking });
    }
  };

  // Backend'e istek gönderip AI cevabını alan fonksiyon (öncekiyle aynı)
  const getGeminiResponse = async (userInputText) => {
    console.log("Sending request to Gemini:", { language, prompt: userInputText });
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,
        character: 'Teacher',
        prompt: userInputText
      }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response from server:", response.status, errorData);
        throw new Error(`Server error: ${response.status} - ${errorData}`);
    }
    const data = await response.json();
    console.log("Received response from Gemini:", data.text);
    return data.text || "Üzgünüm, bir cevap oluşturamadım.";
  };

  // Verilen metni seslendiren fonksiyon (ZAMAN AŞIMI EKLEMESİYLE)
  const speakResponse = (responseText) => {
    if (!('speechSynthesis' in window) || !responseText) {
        console.warn("Speech synthesis not supported or response text is empty.");
        setSpeaking(false);
        return;
    }

    window.speechSynthesis.cancel(); // Önceki konuşmaları temizle

    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.lang = languageCode;

    // ÖNEMLİ: Zaman aşımı temizleme fonksiyonu
    const clearSpeakingTimeout = () => {
        if (speakingTimeoutRef.current) {
            console.log("Clearing speaking timeout.");
            clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = null; // Ref'i temizle
        }
    }

    // Konuşma bittiğinde
    utterance.onend = () => {
      console.log("AI speech finished (onend event).");
      clearSpeakingTimeout(); // Zaman aşımını iptal et
      if (isMounted) {
        setSpeaking(false); // Butonu aktif et
      }
    };

    // Konuşma hatası olduğunda
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error:", event.error);
      clearSpeakingTimeout(); // Zaman aşımını iptal et
      if (isMounted) {
        setSpeaking(false); // Butonu aktif et
      }
    };

    // Konuşmayı başlat
    console.log("Speaking response:", responseText, "with lang:", languageCode);
    window.speechSynthesis.speak(utterance);

    // GÜVENLİK AĞI: Zaman Aşımını Ayarla
    // Belirtilen süre içinde onend veya onerror tetiklenmezse, butonu zorla aktif et.
    speakingTimeoutRef.current = setTimeout(() => {
        console.warn(`Speaking timeout (${MAX_SPEECH_DURATION}ms) reached. Forcing speaking state to false.`);
        if (isMounted) {
            // Hâlâ konuşuyor olabilir, iptal etmeyi dene (isteğe bağlı)
            // window.speechSynthesis.cancel();
            setSpeaking(false); // Butonu aktif et
        }
    }, MAX_SPEECH_DURATION); // 30 saniye sonra çalışacak

  };

    // Gemini konuşmasını durduran fonksiyon (önceki yanıttan eklendi)
    const stopSpeaking = useCallback(() => {
        console.log("Stopping speaking...");
        window.speechSynthesis.cancel(); // Konuşmayı iptal et
        if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = null;
             console.log("Speaking timeout cleared by stopSpeaking.");
        }
        if (isMounted) {
            setSpeaking(false); // AI'ın konuşma durumunu false yap
        }
        console.log("Speaking stopped. Button should be active.");
   }, [isMounted]);

  // Arayüz (JSX)
  return (
    <div className="speech-container">
      <div
        className={`mic-circle ${listening ? 'listening' : ''} ${speaking ? 'speaking' : ''}`}
        onClick={startListening}
        style={{ pointerEvents: listening || speaking ? 'none' : 'auto', cursor: listening || speaking ? 'not-allowed' : 'pointer' }}
        title={listening ? "Dinleniyor..." : (speaking ? "Yapay zeka konuşuyor..." : "Konuşmak için tıklayın")}
      >
        🎤
      </div>

       {/* Gemini konuşurken durdur butonu görünür - Önceki yanıttan eklendi */}
       {speaking && (
           <button onClick={stopSpeaking} className="stop-button">
               Durdur ⏹️
           </button>
       )}

      <p className="instruction-text">
        {listening ? "Dinleniyor..." : (!speaking && "Mikrofona tıklayarak konuşmaya başlayın")}
        {/* Buradaki koşul güncellendi: Sadece dinleniyorsa veya konuşma yoksa talimat gösterilir */}
      </p>
    </div>
  );
};

export default SpeechPage;