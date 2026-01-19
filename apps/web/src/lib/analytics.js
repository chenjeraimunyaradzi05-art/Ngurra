import { API_BASE } from '@/lib/apiBase';
import { getAccessToken } from '@/lib/tokenStore';

export async function trackEvent({ eventType, metadata = {} } = {}) {
  try {
    if (!eventType) return;
    const token = getAccessToken();
    await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ eventType, metadata }),
    });
  } catch (err) {
    // swallow errors - analytics should not block UX
     
    console.warn('trackEvent failed', err);
  }
}
