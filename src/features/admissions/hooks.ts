"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  JobApplication,
  Paginated,
  Prospect,
  ProspectStatus,
  JobApplicationStatus,
} from "@/types";
import type {
  ProspectCreateValues,
  JobApplicationValues,
  ProspectEnrollValues,
} from "./schemas";

interface ProspectListFilters {
  status?: ProspectStatus | "all";
  grade?: string;
  from?: string;
  page?: number;
  limit?: number;
}

export function useProspects(filters: ProspectListFilters = {}) {
  return useQuery({
    queryKey: ["prospects", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.status && filters.status !== "all") params.status = filters.status;
      if (filters.grade) params.grade = filters.grade;
      if (filters.from) params.from = filters.from;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      const { data } = await api.get<Paginated<Prospect>>("/admissions/prospects", {
        params,
      });
      return data;
    },
  });
}

export function useProspect(id: string) {
  return useQuery({
    queryKey: ["prospect", id],
    queryFn: async () =>
      (await api.get<Prospect>(`/admissions/prospects/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateProspect() {
  return useMutation({
    mutationFn: async (values: ProspectCreateValues) =>
      (await api.post("/admissions/prospects", values)).data,
  });
}

export function useUpdateProspectStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { status: ProspectStatus; comment?: string }) =>
      (await api.patch(`/admissions/prospects/${id}/status`, values)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospect", id] });
      qc.invalidateQueries({ queryKey: ["prospects"] });
    },
  });
}

export function useEnrollProspect(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProspectEnrollValues) =>
      (await api.post(`/admissions/prospects/${id}/enroll`, values)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospect", id] });
      qc.invalidateQueries({ queryKey: ["prospects"] });
    },
  });
}

interface JobListFilters {
  position?: string;
  status?: JobApplicationStatus | "all";
}

export function useJobApplications(filters: JobListFilters = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.position) params.position = filters.position;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      const { data } = await api.get<Paginated<JobApplication>>(
        "/admissions/jobs",
        { params }
      );
      return data;
    },
  });
}

export function useCreateJobApplication() {
  return useMutation({
    mutationFn: async (values: JobApplicationValues) =>
      (await api.post("/admissions/jobs", values)).data,
  });
}

export function useUpdateJobStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { status: JobApplicationStatus; comment?: string }) =>
      (await api.patch(`/admissions/jobs/${id}/status`, values)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
