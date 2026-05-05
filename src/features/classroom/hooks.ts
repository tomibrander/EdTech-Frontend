"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  AIAssistantResponse,
  ClassroomCourse,
  CourseWork,
  Grade,
} from "@/types";

const EXAM_PREFIX = "[EXAMEN]";

export function useClassroomCourses(filters?: {
  teacherId?: string;
  studentId?: string;
  courseState?: string;
}) {
  return useQuery({
    queryKey: ["classroom", "courses", filters ?? {}],
    queryFn: async () =>
      (
        await api.get<ClassroomCourse[]>("/classroom/courses", {
          params: filters,
        })
      ).data,
  });
}

export function useCourseWork(
  courseId: string,
  type: "all" | "task" | "exam" = "all",
) {
  return useQuery({
    queryKey: ["classroom", courseId, "work", type],
    queryFn: async () =>
      (
        await api.get<{ courseId: string; data: CourseWork[] }>(
          `/classroom/courses/${courseId}/work`,
          { params: { type } },
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
      dueDate?: string;
      dueTime?: string;
      maxPoints?: number;
      type: "task" | "exam";
    }) => {
      const titleHasPrefix = values.title.trim().toUpperCase().startsWith(EXAM_PREFIX);
      const title =
        values.type === "exam" && !titleHasPrefix
          ? `${EXAM_PREFIX} ${values.title.trim()}`
          : values.title;
      const { type: _type, ...rest } = values;
      void _type;
      const payload = { ...rest, title };
      return (await api.post<CourseWork>(
        `/classroom/courses/${courseId}/work`,
        payload,
      )).data;
    },
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
        { params: workId ? { workId } : {} },
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
