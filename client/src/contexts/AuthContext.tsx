import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { getUser, setUser, removeUser, getToken, setToken, removeToken } from "@/lib/api";

interface AuthContextType {
  user: { id: string; name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  login: (userData: { id: string; name: string; email: string; role: string }, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = getUser();
    const savedToken = getToken();
    
    if (savedUser && savedToken) {
      setUserState(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: { id: string; name: string; email: string; role: string }, token: string) => {
    setUser(userData);
    setToken(token);
    setUserState(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeUser();
    removeToken();
    setUserState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected Route Component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/signin");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

