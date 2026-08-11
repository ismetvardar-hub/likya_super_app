const http = require('http');

console.log('===============================================================');
console.log('🔍 CLINE & YEREL AI (qwen-vibecoder) SAĞLIK VE PERFORMANS TESTİ');
console.log('===============================================================');

const postData = JSON.stringify({
  model: 'qwen-vibecoder',
  messages: [
    { role: 'user', content: 'Selam! Likya Kampüsü müşteri ekranındaki 4 konaklama türünü tek bir cümleyle listele.' }
  ],
  stream: false
});

const start = Date.now();

const req = http.request({
  hostname: '127.0.0.1',
  port: 11434,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n1. ⚡ Bağlantı Durumu: HTTP ${res.statusCode} (Yanıt Süresi: ${elapsed} saniye)`);
    
    try {
      const json = JSON.parse(data);
      const content = json.choices[0].message.content;
      console.log(`\n2. 💬 Model Çıktısı:\n"${content}"`);
      
      // Tekrarlama testi
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const uniqueLines = new Set(lines);
      const isLooping = lines.length > 5 && uniqueLines.size < lines.length / 2;
      
      if (isLooping) {
        console.log('\n❌ [HATA] Model halen döngüye giriyor!');
      } else {
        console.log('\n✅ [BAŞARILI] Sıfır döngü! Yanıt son derece akıcı ve net.');
      }
      
      console.log(`\n3. 📊 Token İstatistiği: Giriş: ${json.usage.prompt_tokens}, Çıkış: ${json.usage.completion_tokens}`);
    } catch (e) {
      console.error('JSON parse hatası:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Bağlantı Hatası:', err.message);
});

req.write(postData);
req.end();
