import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../services/auth";
import { getStoredUser, getToken, storeAuth } from "../services/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  signIn: (token: string | null, user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getToken());

  const signIn = (newToken: string | null, authUser: AuthUser) => {
    setToken(newToken);
    setUser(authUser);
    storeAuth(newToken, authUser);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    storeAuth(null, null);
  };

  const value = useMemo(
    () => ({ user, token, signIn, signOut }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
