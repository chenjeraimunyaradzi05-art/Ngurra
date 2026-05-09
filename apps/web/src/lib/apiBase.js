// Central API base for the web app.
// Uses NEXT_PUBLIC_API_URL when provided, otherwise:
// - In browser: Use /api which proxies to the backend via Next.js rewrites
// - In server-side: Use the full URL for direct backend access

const isBrowser = typeof window !== 'undefined';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const productionFallbackApiUrl = 'https://api.tinashe.life';
const localFallbackApiUrl = 'http://localhost:3333';
const serverFallbackApiUrl =
  process.env.NODE_ENV === 'production' ? productionFallbackApiUrl : localFallbackApiUrl;

// In the browser, ALWAYS use the /api proxy (Netlify redirect).
// This avoids CORS issues and keeps auth cookies on the same origin.
// On the server (SSR), use the full backend URL for direct access.
export const API_BASE = isBrowser ? '/api' : envApiUrl || serverFallbackApiUrl;

export function withApiBase(path = '') {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
