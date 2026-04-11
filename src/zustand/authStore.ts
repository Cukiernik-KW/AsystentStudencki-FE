import { create } from "zustand";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../lib/auth-api";
import { setUnauthorizedHandler } from "../lib/api";
import { queryClient } from "../lib/queryClient";

export type AuthUser = {
  id?: string;
  email: string;
  [key: string]: unknown;
};

type AuthCredentials = {
  email: string;
  password: string;
};

type AuthStoreState = {
  user: AuthUser | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  refreshSession: () => Promise<AuthUser | null>;
  login: (credentials: AuthCredentials) => Promise<AuthUser>;
  register: (credentials: AuthCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Wystapil blad uwierzytelniania.";
};

const resetUserScopedQueries = () => {
  queryClient.clear();
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthLoading: true,
  isAuthenticated: false,
  hasHydrated: false,
  error: null,

  setUser: (user) =>
    {
      set({
        user,
        isAuthenticated: Boolean(user),
        error: null,
      });
    },

  clearAuth: () =>
    {
      resetUserScopedQueries();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isAuthLoading: false,
        hasHydrated: true,
      });
    },

  refreshSession: async () => {
    set({ isAuthLoading: true, error: null });

    try {
      const user = await getMe();
      resetUserScopedQueries();

      set({
        user,
        isAuthenticated: true,
        isAuthLoading: false,
        hasHydrated: true,
        error: null,
      });

      return user;
    } catch (error) {
      resetUserScopedQueries();
      set({
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
        hasHydrated: true,
        error: null,
      });

      return null;
    }
  },

  login: async ({ email, password }) => {
    set({ isAuthLoading: true, error: null });

    try {
      const user = await loginRequest(email, password);
      resetUserScopedQueries();
      set({
        user,
        isAuthenticated: true,
        isAuthLoading: false,
        hasHydrated: true,
        error: null,
      });
      return user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isAuthLoading: false, error: message });
      throw error;
    }
  },

  register: async ({ email, password }) => {
    set({ isAuthLoading: true, error: null });

    try {
      const user = await registerRequest(email, password);
      resetUserScopedQueries();
      set({
        user,
        isAuthenticated: true,
        isAuthLoading: false,
        hasHydrated: true,
        error: null,
      });
      return user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isAuthLoading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    set({ isAuthLoading: true, error: null });

    try {
      await logoutRequest();
    } finally {
      resetUserScopedQueries();
      set({
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
        hasHydrated: true,
        error: null,
      });
    }
  },
}));

setUnauthorizedHandler(() => {
  const state = useAuthStore.getState();

  if (!state.isAuthenticated && state.hasHydrated) {
    return;
  }

  state.clearAuth();
});
