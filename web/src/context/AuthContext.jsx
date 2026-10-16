import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, setUnauthorizedHandler, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // "loading" until we've validated any stored token with the server.
  const [status, setStatus] = useState(tokenStore.get() ? "loading" : "ready");

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.set(null))
      .finally(() => setStatus("ready"));
  }, [logout]);

  const acceptSession = useCallback(
    ({ token, user }) => {
      tokenStore.set(token);
      queryClient.clear();
      setUser(user);
      return user;
    },
    [queryClient]
  );

  const login = useCallback(
    async (email, password) => acceptSession(await api("/auth/login", { method: "POST", body: { email, password } })),
    [acceptSession]
  );

  const register = useCallback(
    async (formData) => acceptSession(await api("/auth/register", { method: "POST", body: formData })),
    [acceptSession]
  );

  const value = useMemo(
    () => ({ user, status, login, register, logout, setUser, isAuthenticated: Boolean(user) }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const homeFor = (user) => (user ? "/dashboard" : "/");
