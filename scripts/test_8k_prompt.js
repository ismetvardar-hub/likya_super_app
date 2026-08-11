const http = require('http');

// Generate 8,000 tokens of context
const dummyContext = 'Likya Açıkhava Kampüsü yazılım projesi 4 ana rolden ve 5 modülden oluşmaktadır. '.repeat(400);

const postData = JSON.stringify({
  model: 'qwen-fast',
  messages: [
    { role: 'system', content: dummyContext },
    { role: 'user', content: 'Selam! Likya Kampüsü müşteri modülünü kısaca açıkla.' }
  ],
  stream: false
});

console.log(`Sending 8.2k token test prompt to qwen-fast...`);
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
    const elapsed = (Date.now() - start) / 1000;
    console.log(`HTTP Status: ${res.statusCode}`);
    console.log(`Elapsed Time: ${elapsed.toFixed(2)} seconds`);
    try {
      const json = JSON.parse(data);
      console.log('Response:', json.choices[0].message.content.substring(0, 300));
      console.log('Tokens used:', json.usage);
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();
