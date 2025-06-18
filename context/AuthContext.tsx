import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token, error, loading, checkToken } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, error, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
