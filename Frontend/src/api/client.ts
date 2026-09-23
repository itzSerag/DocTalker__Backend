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
  withCredentials: true, // Enables HTTP-only strict cookies to be sent with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to handle unauthenticated sessions cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not already on auth/landing pages, can trigger session expiry
    if (error.response?.status === 401) {
      console.warn(
        "Session expired or unauthorized request:",
        error.config?.url,
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
