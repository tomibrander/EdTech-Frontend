"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Role } from "@/config/roles";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  authProvider: "password" | "google";
  googleAccountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAppUsers(params?: {
  role?: Role;
  includeInactive?: boolean;
}) {
  return useQuery({
    queryKey: ["users", params ?? {}],
    queryFn: async () => {
      const search: Record<string, string> = {};
      if (params?.role) search.role = params.role;
      if (params?.includeInactive) search.includeInactive = "true";
      const { data } = await api.get<AppUser[]>("/users", { params: search });
      return data;
    },
  });
}

export function usePendingUsers() {
  return useAppUsers({ role: "pendiente" });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) =>
      (
        await api.patch<AppUser>(`/users/${encodeURIComponent(id)}/role`, {
          role,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
