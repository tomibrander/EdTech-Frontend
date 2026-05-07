"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Course, Paginated, Student } from "@/types";
import { z } from "zod";

export const courseCreateSchema = z.object({
  name: z.string().min(1),
  year: z.coerce.number().int().min(2020),
  section: z.string().optional(),
  teacherId: z.string().optional(),
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
      (
        await api.post<Course>("/courses", {
          name: values.name,
          year: values.year,
          gradeLevel: values.name.split(" ")[0] || undefined,
          division: values.section,
          description: values.descriptionHeading,
          teacherIds: values.teacherId ? [values.teacherId] : [],
          homeroomTeacherId: values.teacherId || undefined,
        })
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export type BulkCourseInput = {
  name: string;
  year: number;
  gradeLevel?: string;
  division?: string;
  description?: string;
  homeroomTeacherId?: string;
  teacherIds?: string[];
  studentIds?: string[];
};

export function useBulkUpsertCourses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courses: BulkCourseInput[]) =>
      (
        await api.post<{
          total: number;
          created: number;
          updated: number;
          data: Array<{
            code: string;
            action: "created" | "updated";
            assignedTeachers: number;
            assignedStudents: number;
            missingStudentIds: string[];
          }>;
        }>("/courses/bulk", { courses })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useStudentSuggestions(search: string) {
  return useQuery({
    queryKey: ["students", "suggestions", search],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Student>>("/students", {
        params: { search, limit: 10, page: 1 },
      });
      return data.data;
    },
    enabled: search.trim().length >= 2,
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
