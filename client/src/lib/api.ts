import { hc } from 'hono/client';
import type { AppType } from '../../../server/src/index';
import { accessToken, setAccessToken } from '../store/auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const client = hc<AppType>(API_URL, {
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const getFetchConfig = () => {
      const token = accessToken();

      const headers = new Headers(requestInit?.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return {
        ...requestInit,
        headers,
        credentials: 'include' as RequestCredentials,
      };
    };

    let response = await fetch(input, getFetchConfig());

    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else {
      urlStr = input.url;
    }

    if (
      response.status === 401 &&
      !urlStr.includes('/login') &&
      !urlStr.includes('/refresh')
    ) {
      try {
        const refreshRes = await fetch(
          `${API_URL}/api/users/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.accessToken) {
            // Store in signal instead of localStorage
            setAccessToken(refreshData.accessToken);
            response = await fetch(input, getFetchConfig());
          } else {
            throw new Error('Refresh failed');
          }
        } else {
          throw new Error('Refresh failed');
        }
      } catch (error) {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }

    return response;
  },
});
