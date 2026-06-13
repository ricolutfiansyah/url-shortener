import { hc } from 'hono/client';
import type { AppType } from '../../../server/src/index';

export const client = hc<AppType>('http://localhost:3000', {
    fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
        const token = localStorage.getItem('accessToken');

        const headers = new Headers(requestInit?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(input, { ...requestInit, headers });
    },
});