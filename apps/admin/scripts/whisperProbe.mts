// 🎙️ Groq Whisper v3 transkripsiyon doğrulama probu (1 sn sessiz WAV)
import { transcribeGroqWhisper } from '../src/app/lib/ai/modelMatrix';

const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + 8000, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(8000, 24);
h.writeUInt32LE(8000, 28); h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34); h.write('data', 36);
h.writeUInt32LE(8000, 40);
const wav = Buffer.concat([h, Buffer.alloc(8000)]);
try {
  const r = await transcribeGroqWhisper(wav.toString('base64'));
  console.log('WHISPER OK — model:', r.model, '| metin:', JSON.stringify(r.text));
} catch (e) {
  console.log('WHISPER auth yanıtı:', String((e as Error).message).slice(0, 90));
}
