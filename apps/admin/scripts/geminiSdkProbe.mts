// SDK üzerinden OmniRoute Plan A (Gemini) canlı doğrulaması
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY ?? '';
if (!apiKey) { console.error('GEMINI_API_KEY yok'); process.exit(1); }
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
const r = await model.generateContent('1 kelime: yanıt');
console.log('SDK PLAN A CANLI:', r.response.text().trim().slice(0, 60));
