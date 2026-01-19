#!/usr/bin/env node
// Lightweight prototype AI server — returns helpful demo responses
// Usage:
// 1) (optional) set OPENAI_API_KEY environment variable to forward requests to OpenAI
// 2) node tools/prototype-ai-server.js

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;

// Very small safety check: limit prompt length
function simpleSimulateResponse(prompt){
  // Provide friendly guidance: echo and a suggested next-step
  const short = (prompt || '').slice(0, 800);
  return {
    text: `Demo server assistant response for: "${short.replace(/\n/g,' ')}"\n\nSuggested next steps:\n1) Consider local training options with a TAFE or RTO.\n2) Book a 1:1 phone mentor session to help prepare your application.\n3) If you require assistance, reply to this message with any accessibility or language support needs.`,
    source: 'simulated'
  };
}

// If OPENAI_API_KEY is available we'll forward the prompt to the OpenAI chat completions API
async function callOpenAI(prompt){
  const key = process.env.OPENAI_API_KEY;
  if(!key) return null;
  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 400 })
    });
    if(!res.ok) throw new Error('OpenAI request failed ' + res.status);
    const j = await res.json();
    const text = j?.choices?.[0]?.message?.content || (j?.choices?.[0]?.text || '');
    return { text: String(text).trim(), source: 'openai' };
  }catch(e){
    console.warn('OpenAI forward failed', e.message || e);
    return null;
  }
}

app.post('/ai/respond', async (req, res) => {
  const prompt = req.body?.prompt || '';
  if(!prompt || String(prompt).trim().length < 1) return res.status(400).json({ error: 'No prompt provided' });
  // try OpenAI if configured
  if(process.env.OPENAI_API_KEY){
    const up = await callOpenAI(prompt);
    if(up) return res.json(up);
  }
  // otherwise send simulated response
  const sim = simpleSimulateResponse(prompt);
  return res.json(sim);
});

app.post('/parse-resume', async (req, res) => {
  // simple keyword extraction – the frontend already has a local matcher. This endpoint demonstrates server parsing.
  const text = (req.body?.text || '').toLowerCase();
  const keywords = ['forklift','welding','apprentice','mentor','trainee','crane','drivers licence','mc','hr','super','tafe','certificate','security','health','community','engagement'];
  const found = [];
  keywords.forEach(k=>{ if(text.includes(k)) found.push(k); });
  return res.json({ skills: found });
});

app.get('/', (req,res)=> res.send('Prototype AI server is running. POST /ai/respond or /parse-resume'));

app.listen(PORT, () => console.log(`Prototype AI server listening on http://localhost:${PORT}`));
