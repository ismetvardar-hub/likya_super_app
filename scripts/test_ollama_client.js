const http = require('http');

// 1. Native Ollama API Test
const ollamaData = JSON.stringify({
  model: 'qwen2.5-coder:7b',
  prompt: 'Merhaba, 2+2 kaç eder? Sadece cevabı ver.',
  stream: false
});

const req1 = http.request({
  hostname: '127.0.0.1',
  port: 11434,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(ollamaData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('--- 1. Native Ollama API Response ---');
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Response:', parsed.response);
      console.log('Eval Duration (ms):', Math.round(parsed.eval_duration / 1000000));
    } catch (e) {
      console.log('Body:', body);
    }
  });
});

req1.on('error', (e) => console.error('Native Ollama Error:', e));
req1.write(ollamaData);
req1.end();

// 2. OpenAI Compatible Endpoint Test (Used by Roo Code)
const openaiData = JSON.stringify({
  model: 'qwen2.5-coder:7b',
  messages: [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'Merhaba, bana kısaca kendini tanıt.' }
  ],
  stream: false
});

const req2 = http.request({
  hostname: '127.0.0.1',
  port: 11434,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ollama',
    'Content-Length': Buffer.byteLength(openaiData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('\n--- 2. OpenAI Compatible API Response ---');
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Message:', parsed.choices[0].message.content);
      console.log('Usage:', parsed.usage);
    } catch (e) {
      console.log('Body:', body);
    }
  });
});

req2.on('error', (e) => console.error('OpenAI Compatible Error:', e));
req2.write(openaiData);
req2.end();
