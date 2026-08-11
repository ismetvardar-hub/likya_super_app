const http = require('http');

// Simulating Roo Code's exact streaming request with large system prompt and tool definitions
const systemPrompt = `You are Roo, a helpful AI assistant that can interact with the user's computer via tools.
You have access to the following tools:
- execute_command: Run a command in the terminal.
- read_file: Read the contents of a file.
- write_to_file: Write code to a file.
- list_files: List files in a directory.

Format your tool calls in XML tags:
<execute_command>
<command>ls -la</command>
</execute_command>
`;

const postData = JSON.stringify({
  model: 'qwen2.5-coder:7b',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Merhaba! Projedeki dosyaları listelemek için bir komut çalıştır.' }
  ],
  options: {
    num_ctx: 8192,
    temperature: 0.2
  },
  stream: true
});

console.log('Sending streaming request to Ollama /api/chat...');
const startTime = Date.now();

const req = http.request({
  hostname: '127.0.0.1',
  port: 11434,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  console.log(`HTTP Status: ${res.statusCode}`);
  let firstChunkTime = null;
  let fullResponse = '';

  res.on('data', (chunk) => {
    if (!firstChunkTime) {
      firstChunkTime = Date.now() - startTime;
      console.log(`Time to First Token (TTFT): ${firstChunkTime}ms`);
    }
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message && json.message.content) {
          process.stdout.write(json.message.content);
          fullResponse += json.message.content;
        }
        if (json.done) {
          console.log('\n\n--- Stream Completed ---');
          console.log(`Total Time: ${Date.now() - startTime}ms`);
        }
      } catch (e) {
        // partial json
      }
    }
  });

  res.on('end', () => {
    console.log('Stream connection closed.');
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(postData);
req.end();
