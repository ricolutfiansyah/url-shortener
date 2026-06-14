import { Show, JSX } from "solid-js";
import { Navigate } from "@solidjs/router";
import { accessToken } from "../store/auth";

export default function ProtectedRoute(props: { children: JSX.Element }) {
    return (
        <Show
            when={accessToken()}
            fallback={<Navigate href="/login" />}
        >
            {props.children}
        </Show>
    )
}