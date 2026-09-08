import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("coalguard_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async ({ email, password, role }) => {
    const { user: loggedInUser } = await api.login({ email, password, role });
    setUser(loggedInUser);
    sessionStorage.setItem("coalguard_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("coalguard_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const ROLE_LABELS = {
  CORPORATE_ADMIN: "Corporate Admin",
  INSPECTOR: "Inspector",
  MINE_OFFICIAL: "Mine Official",
  REGULATOR: "Regulatory Officer",
};
