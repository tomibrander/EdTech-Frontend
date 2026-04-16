"use client";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useCreateWorkspaceUser() {
  return useMutation({
    mutationFn: async (values: {
      firstName: string;
      lastName: string;
      primaryEmail: string;
      password: string;
      orgUnitPath: string;
    }) => (await api.post("/workspace/users", values)).data,
  });
}

export function useMoveUserOU() {
  return useMutation({
    mutationFn: async (values: {
      userKey: string;
      newOrgUnitPath: string;
    }) =>
      (
        await api.patch(`/workspace/users/${values.userKey}/ou`, {
          newOrgUnitPath: values.newOrgUnitPath,
        })
      ).data,
  });
}

export function useSuspendUser() {
  return useMutation({
    mutationFn: async (userKey: string) =>
      (await api.post(`/workspace/users/${userKey}/suspend`)).data,
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: async (values: {
      email: string;
      name: string;
      description?: string;
    }) => (await api.post("/workspace/groups", values)).data,
  });
}
