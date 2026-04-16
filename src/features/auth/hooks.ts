"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { User } from "@/types";
import type { LoginValues, ForgotPasswordValues, ResetPasswordValues } from "./schemas";

export function useLogin() {
  return useMutation({
    mutationFn: async (values: LoginValues) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "No pudimos iniciar sesión");
      }
      return res.json() as Promise<{ user: User }>;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      await api.post("/auth/forgot-password", values);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordValues) => {
      await api.post("/auth/reset-password", { token, newPassword });
    },
  });
}
