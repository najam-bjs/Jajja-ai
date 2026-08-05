import { getToken } from "./auth";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const token = getToken();
  const headers = new Headers(init?.headers ?? undefined);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
