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

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: 'Çok fazla istek yaptınız, lütfen bir süre sonra tekrar deneyin.'
});
app.use('/generate', limiter);

// Yapılandırma dosyasını yükle
const instructions = JSON.parse(fs.readFileSync('systemInstructions.json', 'utf8'));

// Varsayılan bir talimat seçici
let currentInstruction = instructions.instruction_english;

const model = new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: currentInstruction
});

function cleanInput(input) {
    return input.replace(/(.)\1+/g, '$1').replace(/\s+/g, ' ').trim();
}

function simplifyInput(input) {
    if (input.length > 200) {
        input = input.substring(0, 200) + '...';
    }
    return input;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequestWithRetry(prompt, retries = 3) {
    try {
        await delay(2000);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return await response.text();
    } catch (error) {
        console.error('Hata:', error);
        if (error.status === 429 && retries > 0) {
            await delay(5000);
            return makeRequestWithRetry(prompt, retries - 1);
        } else if (retries === 0) {
            return 'Lütfen girdiğinizi kontrol edin ve tekrar deneyin.';
        } else {
            throw error;
        }
    }
}

app.post('/generate', async (req, res) => {
    let { prompt, instructionKey } = req.body;

    if (!prompt) {
        return res.status(400).send('Prompt gerekli.');
    }

    // Dinamik olarak talimatları güncelle
    if (instructionKey && instructions[instructionKey]) {
        currentInstruction = instructions[instructionKey];
        model.setSystemInstruction(currentInstruction); // API'de dinamik güncelleme sağlanabilir mi kontrol et
    }

    prompt = cleanInput(prompt);
    prompt = simplifyInput(prompt);

    try {
        const text = await makeRequestWithRetry(prompt);
        res.json({ text });
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).send('Bir hata oluştu.');
    }
});

app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor.');
});
