import { hc } from 'hono/client';
import type { AppType } from '../../../server/src/index';
import { accessToken, setAccessToken } from '../store/auth';

export const client = hc<AppType>('http://localhost:3000', {
    fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
        const getFetchConfig = () => {
            // Read from the global signal instead of localStorage
            const token = accessToken();

            const headers = new Headers(requestInit?.headers);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return { ...requestInit, headers, credentials: 'include' as RequestCredentials };
        };

        let response = await fetch(input, getFetchConfig());

        // Extract the URL string safely
        let urlStr = '';
        if (typeof input === 'string') {
            urlStr = input;
        } else if (input instanceof URL) {
            urlStr = input.toString();
        } else {
            urlStr = input.url;
        }

        // Only attempt to refresh if the 401 didn't come from /login or /refresh
        if (response.status === 401 && !urlStr.includes('/login') && !urlStr.includes('/refresh')) {
            try {
                const refreshRes = await fetch('http://localhost:3000/api/users/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

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