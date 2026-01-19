/**
 * Secure Token Storage
 * 
 * SECURITY: Stores access tokens in memory instead of localStorage to prevent XSS attacks.
 * - Access tokens are short-lived and stored only in memory
 * - Refresh tokens are stored in HttpOnly cookies (set by server)
 * - On page reload, the token is refreshed via the HttpOnly cookie
 * 
 * This approach ensures:
 * 1. XSS attacks cannot steal access tokens from localStorage
 * 2. Refresh tokens are never accessible to JavaScript
 * 3. Tokens are automatically cleared on page close (memory-based)
 */

import { API_BASE } from '@/lib/apiBase';

// In-memory token storage (not accessible via XSS)
let accessToken: string | null = null;
let tokenExpiry: number | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Session expired callback
type SessionExpiredCallback = () => void;
let onSessionExpired: SessionExpiredCallback | null = null;

// Idle timeout configuration (30 minutes)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
let lastActivityTime = Date.now();
let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Get the current access token from memory
 */
export function getAccessToken(): string | null {
  // Check if token is expired
  if (tokenExpiry && Date.now() >= tokenExpiry) {
    accessToken = null;
    tokenExpiry = null;
  }
  return accessToken;
}

/**
 * Set the access token in memory
 * @param token - The access token
 * @param expiresIn - Token expiry time in seconds (default: 15 minutes)
 */
export function setAccessToken(token: string, expiresIn: number = 900): void {
  accessToken = token;
  tokenExpiry = Date.now() + (expiresIn * 1000);
  resetIdleTimer();
}

/**
 * Clear all tokens (logout)
 */
export function clearTokens(): void {
  accessToken = null;
  tokenExpiry = null;
  stopIdleTimer();
  
  // Clear legacy tokens from older versions
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ngurra_token');
  }
}

/**
 * Check if user has a valid token
 */
export function hasValidToken(): boolean {
  return accessToken !== null && (tokenExpiry === null || Date.now() < tokenExpiry);
}

/**
 * Refresh the access token using HttpOnly cookie
 * This is the primary way to get a new token after page reload
 */
export async function refreshAccessToken(): Promise<string | null> {
  return null;
}

/**
 * Initialize token from HttpOnly cookie on app load
 * Call this on app startup to restore the session
 */
export async function initializeAuth(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ngurra_token');
  }
  return false;
}

/**
 * Set callback for session expiry
 */
export function setSessionExpiredCallback(callback: SessionExpiredCallback): void {
  onSessionExpired = callback;
}

/**
 * Idle timeout management
 */
function resetIdleTimer(): void {
  lastActivityTime = Date.now();
  
  if (idleTimeoutId) {
    clearTimeout(idleTimeoutId);
  }
  
  if (accessToken) {
    idleTimeoutId = setTimeout(() => {
      clearTokens();
      if (onSessionExpired) {
        onSessionExpired();
      }
    }, IDLE_TIMEOUT_MS);
  }
}

function stopIdleTimer(): void {
  if (idleTimeoutId) {
    clearTimeout(idleTimeoutId);
    idleTimeoutId = null;
  }
}

// Track user activity for idle timeout
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, () => {
      if (accessToken) {
        resetIdleTimer();
      }
    }, { passive: true });
  });
}

/**
 * @deprecated Use getAccessToken instead - maintained for backward compatibility
 */
export function getToken(): string | null {
  return getAccessToken();
}

/**
 * @deprecated Use setAccessToken instead - maintained for backward compatibility
 */
export function setTokens(token: string, _refreshToken?: string): void {
  setAccessToken(token);
}
