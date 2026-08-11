const http = require('http');

const OLLAMA_PORT = 11434;
const PROXY_PORT = 11435;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let targetPath = req.url;

  // Universal URL normalization
  if (targetPath.startsWith('/v1/api/')) {
    targetPath = targetPath.replace('/v1/api/', '/api/');
  } else if (targetPath === '/chat/completions' || targetPath.startsWith('/chat/completions?')) {
    targetPath = '/v1' + targetPath;
  }

  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: OLLAMA_PORT,
    path: targetPath,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`🚀 Universal Ollama Proxy on http://127.0.0.1:${PROXY_PORT} -> :${OLLAMA_PORT}`);
});
