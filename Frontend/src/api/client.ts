import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
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
