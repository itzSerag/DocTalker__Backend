import apiClient from "./client";

export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isVerified?: boolean;
  role?: string;
  subscription?: "free" | "Gold" | "Premium" | "admin";
  uploadRequest?: number;
  maxUploadRequest?: number;
  queryRequest?: number;
  queryMax?: number;
  accountType?: string;
  dailyQueriesCount?: number;
  dailyUploadsCount?: number;
  totalTokensUsed?: number;
}

export interface AuthResponse {
  status: string;
  message?: string;
  user?: User;
  token?: string;
  data?: {
    email: string;
    firstName: string;
    lastName?: string;
    token?: string;
  };
}

export const authApi = {
  signup: async (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => {
    const res = await apiClient.post<AuthResponse>("/user/signup", data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<AuthResponse>("/user/login", data);
    return res.data;
  },

  verifyOtp: async (otp: string, email?: string) => {
    const res = await apiClient.post<AuthResponse>("/user/otp/verify", {
      otp,
      email,
    });
    return res.data;
  },

  resendOtp: async (email?: string) => {
    const res = await apiClient.post<{ status: string; message: string }>(
      "/user/otp/resend",
      { email },
    );
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<{ status: string; message: string }>(
      "/user/forgetPassword",
      { email },
    );
    return res.data;
  },

  setNewPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const res = await apiClient.post<{ status: string; message: string }>(
      "/user/setNewPassword",
      data,
    );
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<{ status: string; user: User }>("/user/me");
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.get<{ status: string; message: string }>(
      "/user/logout",
    );
    return res.data;
  },
};

export default authApi;
