"use client";

import { createContext, useContext, useSyncExternalStore, useCallback, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function getAuthSnapshot(): string | null {
  return localStorage.getItem("odaklio-auth");
}

function getServerSnapshot(): string | null {
  return null;
}

let listeners: Array<() => void> = [];
function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function emitChange() {
  for (const l of listeners) l();
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getAuthSnapshot, getServerSnapshot);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === "admin" && password === "password") {
      localStorage.setItem("odaklio-auth", username);
      emitChange();
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("odaklio-auth");
    emitChange();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
