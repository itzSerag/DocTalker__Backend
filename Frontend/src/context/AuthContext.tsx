/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, type User } from "../api/authApi";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOtp: (otp: string, email?: string) => Promise<void>;
  resendOtp: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const res = await authApi.getMe();
      if (res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authApi
      .getMe()
      .then((res) => {
        if (isMounted) {
          setUser(res.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    const token = res.token || res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    await fetchCurrentUser();
  };

  const signup = async (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => {
    const res = await authApi.signup(data);
    const token = res.token || res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const verifyOtp = async (otp: string, email?: string) => {
    const res = await authApi.verifyOtp(otp, email);
    const token = res.token || res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    await fetchCurrentUser();
  };

  const resendOtp = async (email?: string) => {
    await authApi.resendOtp(email);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
