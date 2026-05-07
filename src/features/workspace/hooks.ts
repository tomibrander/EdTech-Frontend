"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  WorkspaceGroup,
  WorkspaceUser,
  WorkspaceUserResetPassword,
} from "@/types";
import type { Role } from "@/config/roles";
import type { AppUser } from "@/features/users/hooks";

export interface CreateWorkspaceUserResult {
  workspaceUser: WorkspaceUser;
  appUser: AppUser;
}

export function useWorkspaceUsers(orgUnitPath?: string) {
  return useQuery({
    queryKey: ["workspace", "users", orgUnitPath ?? "all"],
    queryFn: async () =>
      (
        await api.get<WorkspaceUser[]>("/workspace/users", {
          params: orgUnitPath ? { orgUnitPath } : {},
        })
      ).data,
  });
}

export function useCreateWorkspaceUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      firstName?: string;
      lastName?: string;
      institutionalEmail: string;
      orgUnitPath: string;
      role?: Role;
    }) =>
      (
        await api.post<CreateWorkspaceUserResult>(
          "/workspace/users",
          values,
        )
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace", "users"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useMoveUserOU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { googleId: string; orgUnitPath: string }) =>
      (
        await api.patch<WorkspaceUser>(
          `/workspace/users/${values.googleId}/ou`,
          { orgUnitPath: values.orgUnitPath },
        )
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", "users"] }),
  });
}

export function useResetWorkspacePassword() {
  return useMutation({
    mutationFn: async (userKey: string) =>
      (
        await api.post<WorkspaceUserResetPassword>(
          `/workspace/users/${encodeURIComponent(userKey)}/reset-password`,
        )
      ).data,
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (googleId: string) => {
      await api.delete(`/workspace/users/${googleId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", "users"] }),
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: async (values: {
      email: string;
      name: string;
      description?: string;
      members?: string[];
    }) => (await api.post<WorkspaceGroup>("/workspace/groups", values)).data,
  });
}
