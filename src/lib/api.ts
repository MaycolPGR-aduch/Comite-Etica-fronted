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

  if (token) {
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
