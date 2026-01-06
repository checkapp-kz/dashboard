import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import type { User, AuthState } from "./types";
import { useEffect, useState, useCallback, useRef } from "react";

const API_BASE_URL = "https://checkapp.kz/api";

// Decode JWT payload without verification (for reading expiration time)
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Get token expiration time in milliseconds
function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000; // Convert to milliseconds
}

// Check if token will expire within given milliseconds
function willTokenExpireSoon(token: string, withinMs: number = 5 * 60 * 1000): boolean {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true; // If we can't determine, assume it will expire
  return Date.now() + withinMs >= expirationTime;
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  _refreshToken: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get, store) => ({
      user: null,
      accessToken: null,
      _refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          _refreshToken: refreshToken,
          isAuthenticated: true,
        });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password,
          });

          const { access_token, refresh_token, user } = response.data;

          set({
            user,
            accessToken: access_token,
            _refreshToken: refresh_token,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          console.error("Login failed:", error);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          _refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        const { _refreshToken } = get();
        if (!_refreshToken) return false;

        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: _refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          set({
            accessToken: access_token,
            _refreshToken: refresh_token,
          });

          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
          return false;
        }
      },
    }),
    {
      name: "checkapp-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        _refreshToken: state._refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook to check if zustand store has been hydrated from localStorage
export const useAuthHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated (only runs on client)
    if (useAuthStore.persist?.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Subscribe to hydration finish event
    const unsubFinishHydration = useAuthStore.persist?.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubFinishHydration?.();
    };
  }, []);

  return hydrated;
};

// Hook for proactive token refresh - refreshes token before it expires
export const useProactiveTokenRefresh = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const checkAndRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    // Refresh if token will expire within 5 minutes
    if (willTokenExpireSoon(token, 5 * 60 * 1000)) {
      isRefreshingRef.current = true;
      console.log("[Auth] Token expiring soon, refreshing proactively...");

      const success = await refreshToken();
      if (success) {
        console.log("[Auth] Token refreshed successfully");
      } else {
        console.warn("[Auth] Proactive token refresh failed");
      }

      isRefreshingRef.current = false;
    }
  }, [refreshToken]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    checkAndRefresh();

    // Check every 2 minutes
    intervalRef.current = setInterval(checkAndRefresh, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, checkAndRefresh]);
};

// Event emitter for auth errors (allows UI to react without immediate redirect)
type AuthErrorCallback = (error: { type: "session_expired" | "refresh_failed" }) => void;
const authErrorListeners = new Set<AuthErrorCallback>();

export const onAuthError = (callback: AuthErrorCallback): (() => void) => {
  authErrorListeners.add(callback);
  return () => {
    authErrorListeners.delete(callback);
  };
};

export const emitAuthError = (error: { type: "session_expired" | "refresh_failed" }) => {
  authErrorListeners.forEach((callback) => callback(error));
};
