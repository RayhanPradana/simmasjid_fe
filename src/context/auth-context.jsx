"use client";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {

    if (email === "admin@gmail.com" && password === "password") {
      const loggedUser = { name: "Admin SimMasjid", email };
      setUser(loggedUser);
      return { success: true };
    }
    return { success: false, message: "Email atau password salah" };
  };

  const register = async (name, email, password) => {
    const newUser = { name, email };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
