const jwt = require('jsonwebtoken');

/**
 * Admin Authentication Endpoint
 * 
 * SECURITY: Requires the following environment variables (no defaults for security):
 * - ADMIN_USER: Admin username
 * - ADMIN_PASS: Admin password (min 12 chars recommended)
 * - ADMIN_JWT_SECRET: JWT signing secret (min 32 chars)
 * 
 * @route POST /auth
 * @body { username: string, password: string }
 * @returns { token: string } on success
 */
exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
    
    // Security: Require all env vars - no fallback defaults
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASS;
    const secret = process.env.ADMIN_JWT_SECRET;
    
    if (!user || !pass || !secret) {
      console.error('SECURITY: Missing required environment variables (ADMIN_USER, ADMIN_PASS, ADMIN_JWT_SECRET)');
      return { statusCode: 503, body: JSON.stringify({ error: 'Authentication service not configured' }) };
    }
    
    if (secret.length < 32) {
      console.error('SECURITY: ADMIN_JWT_SECRET must be at least 32 characters');
      return { statusCode: 503, body: JSON.stringify({ error: 'Authentication service misconfigured' }) };
    }
    
    const body = JSON.parse(event.body || '{}');

    if(body.username === user && body.password === pass){
      const token = jwt.sign({ sub: user, role: 'admin' }, secret, { expiresIn: '6h' });
      return { statusCode: 200, body: JSON.stringify({ token }) };
    }

    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }catch(e){
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
