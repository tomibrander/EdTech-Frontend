"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, Student } from "@/types";

interface StudentListFilters {
  courseId?: string;
  year?: number;
  search?: string;
}

export function useStudents(filters: StudentListFilters = {}) {
  return useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.year) params.year = filters.year;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get<Paginated<Student>>("/students", { params });
      return data;
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => (await api.get<Student>(`/students/${id}`)).data,
    enabled: !!id,
  });
}

export function useUpdateParents(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parents: { name: string; email: string; phone?: string }[]) =>
      api.put(`/students/${studentId}/parents`, { parents }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
    },
  });
}
