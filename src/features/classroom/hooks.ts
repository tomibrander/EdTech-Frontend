"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  AIAssistantResponse,
  CourseWork,
  Grade,
  Paginated,
} from "@/types";

export function useCourseWork(courseId: string, type: "all" | "task" | "exam" = "all") {
  return useQuery({
    queryKey: ["classroom", courseId, "work", type],
    queryFn: async () =>
      (
        await api.get<Paginated<CourseWork>>(
          `/classroom/courses/${courseId}/work`,
          { params: { type } }
        )
      ).data,
    enabled: !!courseId,
  });
}

export function useCreateCourseWork(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      title: string;
      description?: string;
      dueDate: string;
      dueTime?: string;
      maxPoints: number;
      type: "task" | "exam";
    }) =>
      (
        await api.post(`/classroom/courses/${courseId}/work`, values)
      ).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["classroom", courseId, "work"] }),
  });
}

export function useCourseGrades(courseId: string, workId?: string) {
  return useQuery({
    queryKey: ["classroom", courseId, "grades", workId],
    queryFn: async () => {
      const { data } = await api.get<{ courseId: string; data: Grade[] }>(
        `/classroom/courses/${courseId}/grades`,
        { params: workId ? { workId } : {} }
      );
      return data;
    },
    enabled: !!courseId,
  });
}

export function useSubmitGrades(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      workId: string;
      grades: { studentId: string; grade: number }[];
    }) =>
      (await api.post(`/classroom/courses/${courseId}/grades`, payload)).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["classroom", courseId, "grades"] }),
  });
}

export function useAIQuery() {
  return useMutation({
    mutationFn: async (query: string) =>
      (await api.post<AIAssistantResponse>("/classroom/ai-query", { query }))
        .data,
  });
}
