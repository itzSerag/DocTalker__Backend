import axios from "axios";

// Normalize VITE_API from environment
const rawApiUrl = (import.meta.env.VITE_API || "").trim();

export const getApiBaseUrl = (): string => {
  if (!rawApiUrl) return "/api";
  const sanitized = rawApiUrl.replace(/\/+$/, "");
  return sanitized.endsWith("/api") ? sanitized : `${sanitized}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends and receives the HTTP-only auth cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT Bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle unauthenticated sessions cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only warn if not a routine initial session probe to /user/me
      if (!error.config?.url?.includes("/user/me")) {
        console.warn(
          "Session expired or unauthorized request:",
          error.config?.url,
        );
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
