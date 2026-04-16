import { z } from "zod";

export const prospectCreateSchema = z.object({
  studentName: z.string().min(2, "Nombre muy corto"),
  birthDate: z.string().min(1, "Requerido"),
  gradeApplying: z.string().min(1, "Requerido"),
  parentName: z.string().min(2, "Requerido"),
  parentEmail: z.string().email("Email inválido"),
  parentPhone: z.string().optional(),
  notes: z.string().optional(),
});
export type ProspectCreateValues = z.infer<typeof prospectCreateSchema>;

export const jobApplicationSchema = z.object({
  position: z.string().min(2, "Requerido"),
  applicantName: z.string().min(2, "Requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cvUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  coverLetter: z.string().optional(),
});
export type JobApplicationValues = z.infer<typeof jobApplicationSchema>;

export const prospectEnrollSchema = z.object({
  courseId: z.string().min(1, "Requerido"),
  classroomCourseId: z.string().min(1, "Requerido"),
  institutionalEmail: z.string().email("Email inválido"),
});
export type ProspectEnrollValues = z.infer<typeof prospectEnrollSchema>;
