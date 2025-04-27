import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Rate limiter - Aynı IP'den çok fazla istek yapılmasını engellemek için
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 dakika
    max: 5, // Aynı dakika içinde 5 istek
    message: 'Çok fazla istek yaptınız, lütfen bir süre sonra tekrar deneyin.'
});
app.use('/generate', limiter);

// System instructions dosyasını okuma
const instructions = JSON.parse(fs.readFileSync('systemInstructions.json', 'utf8'));

// Default model generation configuration
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// Google Generative AI model örneği oluşturma
const modelInstance = (systemInstruction) => {
    return new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({
        model: "gemini-1.5-flash",  // Model ismi
        systemInstruction: systemInstruction,
        generationConfig: generationConfig,
    });
};

// İlk başta default bir model ile başla
let model = modelInstance(instructions.instruction_english);

// Kullanıcıdan gelen girdi ile modele istekte bulunma
async function makeRequestWithRetry(prompt, retries = 3) {
    try {
        await delay(2000);  // API çağrılarına küçük bir gecikme ekleyelim
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return await response.text();
    } catch (error) {
        console.error('Hata:', error);
        if (error.status === 429 && retries > 0) {
            await delay(5000);  // Çok fazla istek durumunda 5 saniye bekleyip tekrar deneyelim
            return makeRequestWithRetry(prompt, retries - 1);
        } else if (retries === 0) {
            return 'Lütfen girdiğinizi kontrol edin ve tekrar deneyin.';
        } else {
            throw error;
        }
    }
}

// Helper function for delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// POST isteği ile dil, karakter ve prompt bilgisi alınıp yanıt oluşturuluyor
app.post('/generate', async (req, res) => {
    const { language, character, prompt } = req.body;

    // Eğer dil veya prompt verilmediyse hata döndür
    if (!language || !prompt) {
        return res.status(400).json({ error: 'Geçersiz veya eksik veri.' });
    }

    // Dil parametresiyle gelen sistem talimatlarını güncelle
    const systemInstruction = `Seninle dil pratiği yapmak isteyen birisi var. Sen bir ${language} öğretmenisin ve sadece ${language} dilinde konuşuyorsun. Eğer kullanıcı farklı bir dilde konuşursa, onu uyar ve sadece ${language} dilinde konuşmaya devam et. Sana verilen ilk prompttaki kurallar bütün konuşma boyunca geçerlidir.`;

    model = modelInstance(systemInstruction);  // Yeni talimatlarla modeli güncelle

    // Modelden gelen yanıtı almak
    try {
        const text = await makeRequestWithRetry(prompt);
        res.json({ text });  // AI'dan gelen cevabı frontend'e gönder
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Bir hata oluştu.');
    }
});
app.get('/', (req, res) => {
    res.send('Sunucu çalışıyor!');
});

// Server'ı dinlemeye başla
app.listen(5000, () => {!
    console.log('Sunucu 5000 portunda çalışıyor.');
});
