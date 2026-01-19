const fetch = require('node-fetch');

exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: 'Method not allowed' };
    const body = JSON.parse(event.body || '{}');
    const text = (body.text||'').slice(0, 20000); // safety

    // If OPENAI_KEY is configured, forward to the API (server-side)
    if(process.env.OPENAI_API_KEY){
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{role:'system', content: 'Extract key skills and short summary from resume text, return JSON with fields skills (array) and summary (string).'}, {role:'user', content: text}], max_tokens: 400 })
      });
      const j = await res.json();
      // basic pass-through
      return { statusCode: 200, body: JSON.stringify({ ok:true, data: j }) };
    }

    // fallback simple keyword extractor
    const keywords = ['welding','forklift','crane','apprentice','tafe','certificate','community','mentor','driver','MC','HR','supervisor'];
    const lc = text.toLowerCase();
    const found = keywords.filter(k => lc.includes(k));
    return { statusCode:200, body: JSON.stringify({ ok:true, data: { skills: [...new Set(found)], summary: text.substring(0, 200) } }) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({ error: e.message }) } }
}
