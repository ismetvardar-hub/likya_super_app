const http = require('http');

const postData = JSON.stringify({
  model: 'qwen-cline',
  messages: [
    {
      role: 'system',
      content: `You are Cline, an autonomous AI assistant that executes actions by outputting XML tags.
When the user asks you to create or write a file, you MUST output ONLY the XML tool call:
<write_to_file>
<path>filepath</path>
<content>
file content
</content>
</write_to_file>
Do not write JSON. Do not write markdown explanations.`
    },
    {
      role: 'user',
      content: 'test_dosyasi.txt adında bir dosya oluştur ve içine "Likya Kampüsü Yerel AI Başarıyla Çalışıyor!" yaz.'
    }
  ],
  stream: false
});

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
    const json = JSON.parse(data);
    console.log("LLM Output:\n", json.choices[0].message.content);
  });
});

req.write(postData);
req.end();
