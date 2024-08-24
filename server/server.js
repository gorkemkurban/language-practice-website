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

const instructions = JSON.parse(fs.readFileSync('systemInstructions.json', 'utf8'));

const modelInstance = (systemInstruction) => {
    return new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
    });
};

let model = modelInstance(instructions.instruction_english);

function cleanInput(input) {
    return input ? input.replace(/(.)\1+/g, '$1').replace(/\s+/g, ' ').trim() : '';
}

function simplifyInput(input) {
    return input.length > 200 ? input.substring(0, 200) + '...' : input;
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
    const { language, character, prompt } = req.body;

    if (!language || !prompt) {
        return res.status(400).send('Geçersiz veya eksik veri.');
    }

    // Talimatları güncelle
    switch (language) {
        case 'French':
            switch (character) {
                case 'Teacher':
                    model = modelInstance(instructions.instruction_french_teacher);
                    break;
                case 'Doctor':
                    model = modelInstance(instructions.instruction_french_doctor);
                    break;
            }
            break;
        case 'Turkish':
            switch (character) {
                case 'Teacher':
                    model = modelInstance(instructions.instruction_turkish_teacher);
                    break;
                case 'Doctor':
                    model = modelInstance(instructions.instruction_turkish_doctor);
                    break;
            }
            break;
        case 'English':
            switch (character) {
                case 'Teacher':
                    model = modelInstance(instructions.instruction_english_teacher);
                    break;
                case 'Doctor':
                    model = modelInstance(instructions.instruction_english_doctor);
                    break;
            }
            break;
        default:
            model = modelInstance(instructions.instruction_default);
            break;
    }

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
