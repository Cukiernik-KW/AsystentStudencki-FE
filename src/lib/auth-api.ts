import { apiRequest } from "./api";
import type { AuthUser } from "../zustand/authStore";

type AuthResponse = {
  user?: AuthUser;
  data?: AuthUser;
  email?: string;
  id?: string;
  [key: string]: unknown;
};

const toUser = (payload: AuthResponse): AuthUser => {
  if (payload.user && typeof payload.user.email === "string") {
    return payload.user;
  }

  if (payload.data && typeof payload.data.email === "string") {
    return payload.data;
  }

  if (typeof payload.email === "string") {
    return {
      ...payload,
      email: payload.email,
    };
  }

  throw new Error("Backend nie zwrocil danych uzytkownika.");
};

export const register = async (email: string, password: string) => {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password },
  });

  return toUser(response);
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return toUser(response);
};

export const logout = async () => {
  await apiRequest<void>("/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  const response = await apiRequest<AuthResponse>("/auth/me");
  return toUser(response);
};
