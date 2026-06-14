import { createSignal } from 'solid-js';
import { client } from '../lib/api';

export const [accessToken, setAccessToken] = createSignal<string | null>(null);
export const [isAuthLoading, setIsAuthLoading] = createSignal<boolean>(true);

export const initializeAuth = async () => {
    setIsAuthLoading(true);
    try {
        const res = await client.api.users.refresh.$post();
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.accessToken) {
                setAccessToken(data.accessToken);
            }
        }
    } catch (error) {
        setAccessToken(null);
    } finally {
        setIsAuthLoading(false);
    }
};