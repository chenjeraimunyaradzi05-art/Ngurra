'use client';

/**
 * Authentication Hook (TypeScript)
 *
 * Adapts the Zustand authStore for components expecting the useAuth hook pattern.
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { API_BASE } from '../lib/apiBase';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || hasFetchedRef.current || user || !token) return;
    hasFetchedRef.current = true;

    fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Unauthorized');
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((payload) => {
        if (payload?.data) {
          setUser({
            id: payload.data.id,
            email: payload.data.email,
            userType: String(payload.data.userType || '').toLowerCase(),
            profile: payload.data.profile,
          });
        }
      })
      .catch(() => {
        setToken(null);
        logout();
      });
  }, [hasHydrated, user, token, setUser, setToken, logout]);

  return {
    user,
    token,
    // Only show as authenticated after hydration to avoid flicker
    isAuthenticated: hasHydrated ? isAuthenticated : false,
    isLoading: !hasHydrated || isLoading,
    setUser,
    setToken,
    logout,
  };
}

export default useAuth;
