import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../Services/apiClient";

interface User {
  id: string;
  email: string;
  username: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, refreshToken?: string) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const initAuth = async () => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setTokenState(storedToken);
    }
    setIsLoading(false); 
  };

  initAuth();
}, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      
      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setTokenState(data.accessToken);
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setTokenState(null);
    setUser(null);
  };

  const setToken = (newToken: string, refreshToken?: string) => {
    localStorage.setItem("authToken", newToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
};
