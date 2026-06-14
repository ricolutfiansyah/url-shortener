import { createSignal } from "solid-js";

const initialToken = localStorage.getItem('accessToken');

export const [accessToken, setAccessToken] = createSignal(initialToken);

export const loginUser = (token: string) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token)
}

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
}