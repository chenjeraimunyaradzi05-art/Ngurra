const jwt = require('jsonwebtoken');
const { deleteAppFromFile } = require('./helpers');

/**
 * Admin Delete Endpoint
 * 
 * SECURITY: Requires ADMIN_JWT_SECRET environment variable (no default)
 */
exports.handler = async function(event){
  try{
    // Security: Require JWT secret - no fallback
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error('SECURITY: Missing ADMIN_JWT_SECRET environment variable');
      return { statusCode: 503, body: JSON.stringify({ error: 'Service not configured' }) };
    }
    
    const auth = event.headers.authorization || event.headers.Authorization || '';
    const token = (auth||'').replace(/^Bearer\s*/i,'');
    if(!token) return { statusCode: 401, body: JSON.stringify({ error:'Missing token' }) };
    try{ jwt.verify(token, secret); }catch(e){ return { statusCode: 403, body: JSON.stringify({ error:'Invalid token' }) }; }

    const body = JSON.parse(event.body || '{}');
    const id = body.id;
    if(!id) return {statusCode:400, body: JSON.stringify({ error: 'Missing id' }) };
    await deleteAppFromFile(id);
    return { statusCode:200, body: JSON.stringify({ success:true }) };
  }catch(e){
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
}
