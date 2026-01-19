#!/usr/bin/env node
// Simple WebSocket-based dev messaging server
// Usage: node tools/dev-messaging-server.js --port 8085 --persist data/messages.json

const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const argv = require('minimist')(process.argv.slice(2));
const PORT = parseInt(argv.port || 8085, 10);
const PERSIST_FILE = argv.persist ? path.resolve(argv.persist) : null;

let messages = [];
if (PERSIST_FILE && fs.existsSync(PERSIST_FILE)) {
  try { messages = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8') || '[]'); } catch(e){ console.warn('Failed to read persist file', e); messages = []; }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/messages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Dev messaging server — use WebSocket');
});

const wss = new WebSocket.Server({ server });

function persist() {
  if (!PERSIST_FILE) return;
  try { fs.mkdirSync(path.dirname(PERSIST_FILE), { recursive: true }); fs.writeFileSync(PERSIST_FILE, JSON.stringify(messages, null, 2)); } catch(e){ console.warn('Failed to persist messages', e); }
}

wss.on('connection', function connection(ws) {
  // send existing messages to the newly connected client
  try { ws.send(JSON.stringify({ type: 'history', messages })); } catch(e){}

  ws.on('message', function incoming(data) {
    try {
      const payload = JSON.parse(String(data));
      if (payload && payload.type === 'message') {
        // normalize
        const m = { id: Date.now() + '-' + Math.random().toString(36).slice(2,8), text: payload.text || '', type: payload.msgType || 'text', author: payload.author || 'user', time: payload.time || new Date().toISOString(), extra: payload.extra || null };
        messages.push(m);
        // keep reasonable size
        if (messages.length > 1000) messages = messages.slice(-1000);
        persist();
        // broadcast to all clients
        const msg = JSON.stringify({ type: 'message', message: m });
        wss.clients.forEach(function each(client) { if (client.readyState === WebSocket.OPEN) client.send(msg); });
      }
    } catch (err) { console.error('Invalid message', err); }
  });
});

server.listen(PORT, () => {
  console.log(`Dev messaging server listening on http://localhost:${PORT}`);
  if (PERSIST_FILE) console.log('Persisting messages to', PERSIST_FILE);
});
