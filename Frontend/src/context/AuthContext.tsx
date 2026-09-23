/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
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
  const sessionRequestId = useRef(0);

  const fetchCurrentUser = async (): Promise<void> => {
    const requestId = ++sessionRequestId.current;
    setLoading(true);
    try {
      const res = await authApi.getMe();
      if (requestId === sessionRequestId.current) {
        setUser(res.user || null);
      }
    } catch (error) {
      if (requestId === sessionRequestId.current) {
        localStorage.removeItem("token");
        setUser(null);
      }
      throw error;
    } finally {
      if (requestId === sessionRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    const requestId = ++sessionRequestId.current;
    let isCurrent = true;
    authApi
      .getMe()
      .then((res) => {
        if (isCurrent && requestId === sessionRequestId.current) {
          setUser(res.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent && requestId === sessionRequestId.current) {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    sessionRequestId.current++;
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
    sessionRequestId.current++;
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
    sessionRequestId.current++;
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
