const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token?: string;
  user?: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

export async function register(
  u_name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ u_name, email, password }),
  });

  return response.json();
}

export function storeAuth(token: string | null, user: AuthUser | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  storeAuth(null, null);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() || getStoredUser());
}
