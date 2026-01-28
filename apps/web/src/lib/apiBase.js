// Central API base for the web app.
// Uses NEXT_PUBLIC_API_URL when provided, otherwise:
// - In browser: Use /api which proxies to the backend via Next.js rewrites
// - In server-side: Use the full URL for direct backend access

const isBrowser = typeof window !== 'undefined';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

// In the browser, always use the Next.js /api proxy.
// This avoids CSP/CORS issues and keeps auth cookies on the same origin.
// On the server, use the full backend URL when provided.
// Prefer explicit NEXT_PUBLIC_API_URL in all environments (including browser)
export const API_BASE = envApiUrl || (isBrowser ? '/api' : 'http://localhost:3333');

export function withApiBase(path = '') {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
