const WebSocket = require('ws');
const url = process.argv[2] || 'ws://localhost:8085';
const w = new WebSocket(url);

w.on('open', () => {
  console.log('Connected to', url);
  const payload = { type: 'message', text: 'hello from test client', msgType: 'text', author: 'me', time: new Date().toISOString(), extra: { tempId: 'local-test-' + Date.now() } };
  w.send(JSON.stringify(payload));
});

w.on('message', (m) => {
  try{
    const data = JSON.parse(String(m));
    console.log('Received event:', data);
  }catch(e){ console.log('raw msg', m.toString()); }
});

w.on('error', err => console.error('WS err', err));
setTimeout(() => { console.log('closing'); w.close(); }, 3000);
