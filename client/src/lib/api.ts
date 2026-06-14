import { hc } from 'hono/client';
import type { AppType } from '../../../server/src/index';

export const client = hc<AppType>('http://localhost:3000', {
    fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
        const getFetchConfig = () => {
            const token = localStorage.getItem('accessToken');

            const headers = new Headers(requestInit?.headers);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return { ...requestInit, headers, credentials: 'include' as RequestCredentials };
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

        const isAuthRequest = !urlStr.includes('/login') && !urlStr.includes('/refresh')

        if (response.status === 401 && isAuthRequest) {
            try {
                const refreshRes = await fetch('http://localhost:3000/api/users/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    if (refreshData.success && refreshData.accessToken) {
                        localStorage.setItem('accessToken', refreshData.accessToken);

                        response = await fetch(input, getFetchConfig());
                    } else {
                        throw new Error('Refresh failed');
                    }
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (error) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }

        return response;
    },
});