import { Show, JSX, onMount } from "solid-js";
import { Navigate } from "@solidjs/router";
import { accessToken, isAuthLoading, initializeAuth } from "../../store/auth";

export default function ProtectedRoute(props: { children: JSX.Element }) {
    onMount(() => {
        if (!accessToken()) {
            initializeAuth();
        }
    });

    return (
        <Show
            when={!isAuthLoading()}
            fallback={
                <div class="min-h-screen bg-background flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            }
        >
            <Show
                when={accessToken()}
                fallback={<Navigate href="/login" />}
            >
                {props.children}
            </Show>
        </Show>
    );
}
