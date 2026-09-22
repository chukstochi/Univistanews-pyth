import { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("univista_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    const { access_token, user } = res.data;
    localStorage.setItem("univista_token", access_token);
    localStorage.setItem("univista_user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("univista_token");
    localStorage.removeItem("univista_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem("univista_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isAuthor: user?.role === "author",
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}