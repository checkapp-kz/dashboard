import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import type { User, AuthState } from "./types";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3001/api";

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
            refresh_token: _refreshToken,
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
