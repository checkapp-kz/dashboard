import axios from "axios";
import { useAuthStore, emitAuthError } from "./auth";

const API_BASE_URL = "https://checkapp.kz/api";

// Key for storing form data backup before auth redirect
export const FORM_BACKUP_KEY = "checkapp-form-backup";

// Save current form data to localStorage before auth redirect
export const saveFormBackup = (formData: unknown, path: string) => {
  try {
    localStorage.setItem(
      FORM_BACKUP_KEY,
      JSON.stringify({
        data: formData,
        path,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.error("[FormBackup] Failed to save form data:", e);
  }
};

// Get saved form backup
export const getFormBackup = (): { data: unknown; path: string; timestamp: number } | null => {
  try {
    const backup = localStorage.getItem(FORM_BACKUP_KEY);
    if (!backup) return null;
    const parsed = JSON.parse(backup);
    // Only return if backup is less than 1 hour old
    if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
      clearFormBackup();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// Clear form backup
export const clearFormBackup = () => {
  localStorage.removeItem(FORM_BACKUP_KEY);
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401/403 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) and 403 (Forbidden/expired token)
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshed = await useAuthStore.getState().refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        const token = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api.request(originalRequest);
      }

      // Emit auth error event so UI can save form data
      emitAuthError({ type: "refresh_failed" });

      // Give time for form backup to complete before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If refresh failed, logout and redirect
      useAuthStore.getState().logout();
      window.location.href = "/login?session_expired=true";
    }
    return Promise.reject(error);
  }
);

export default api;
