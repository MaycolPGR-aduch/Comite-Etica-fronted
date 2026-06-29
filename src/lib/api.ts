// src/lib/api.ts

import axios from "axios";

import { clearAuthSession, getAuthToken } from "@/services/auth-session";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://comite-backend.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  // No pisar un header Authorization puesto explícitamente en la llamada
  // (p. ej. el token recién emitido durante el login, antes de persistirlo).
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  },
);
