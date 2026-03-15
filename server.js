const http = require('http');
const https = require('https');
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const { apiKey, messages } = parsed;
      const payload = JSON.stringify({ model: "llama-3.3-70b-versatile", messages: messages, max_tokens: 1000, temperature: 0.3 });
      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(payload) }
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          try {
            const groqRes = JSON.parse(data);
            const text = groqRes?.choices?.[0]?.message?.content || '';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ content: [{ text }] }));
          } catch(e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
        });
      });
      proxyReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      proxyReq.write(payload);
      proxyReq.end();
    } catch(e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
  });
});
server.listen(3001, () => console.log('Groq proxy running on port 3001'));