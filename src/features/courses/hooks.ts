"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Course, Paginated, Student } from "@/types";
import { z } from "zod";

export const courseCreateSchema = z.object({
  name: z.string().min(1),
  year: z.coerce.number().int().min(2020),
  section: z.string().optional(),
  teacherId: z.string().min(1),
  descriptionHeading: z.string().optional(),
});
export type CourseCreateValues = z.infer<typeof courseCreateSchema>;

export function useCourses(year?: number) {
  return useQuery({
    queryKey: ["courses", { year }],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Course>>("/courses", {
        params: year ? { year } : {},
      });
      return data;
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CourseCreateValues) =>
      (await api.post<Course>("/courses", values)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useCourseStudents(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId, "students"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Student>>("/students", {
        params: { courseId },
      });
      return data;
    },
    enabled: !!courseId,
  });
}

export function useAddStudentToCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) =>
      (await api.post(`/courses/${courseId}/students`, { studentId })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId, "students"] }),
  });
}

export function useRemoveStudentFromCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      await api.delete(`/courses/${courseId}/students/${studentId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses", courseId, "students"] }),
  });
}
