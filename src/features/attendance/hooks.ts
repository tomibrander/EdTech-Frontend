"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  AttendanceAuditEntry,
  AttendanceRecord,
  AttendanceSummary,
  AttendanceStatus,
  Paginated,
} from "@/types";

interface AttendanceListFilters {
  studentId?: string;
  courseId?: string;
  from?: string;
  to?: string;
}

export function useAttendance(filters: AttendanceListFilters) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AttendanceRecord>>("/attendance", {
        params: filters,
      });
      return data;
    },
    enabled: !!(filters.courseId || filters.studentId),
  });
}

export function useSubmitAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      courseId: string;
      date: string;
      records: { studentId: string; status: AttendanceStatus; note?: string }[];
    }) => (await api.post("/attendance", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useUpdateAttendanceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: AttendanceStatus;
      note?: string;
    }) => (await api.patch(`/attendance/${id}`, { status, note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

interface AttendanceLogFilters {
  courseId?: string;
  from?: string;
  to?: string;
  userId?: string;
}

/**
 * Historial de auditoría de cambios de asistencia.
 * Endpoint: GET /attendance/logs
 * Pendiente de implementación en backend (Cassandra / tabla append-only).
 */
export function useAttendanceLogs(filters: AttendanceLogFilters) {
  return useQuery({
    queryKey: ["attendance", "logs", filters],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AttendanceAuditEntry>>(
        "/attendance/logs",
        { params: filters }
      );
      return data;
    },
    enabled: true,
  });
}

export function useAttendanceSummary(studentId: string, year?: number) {
  return useQuery({
    queryKey: ["attendance", "summary", studentId, year],
    queryFn: async () => {
      const { data } = await api.get<AttendanceSummary>(
        `/attendance/summary/${studentId}`,
        { params: year ? { year } : {} }
      );
      return data;
    },
    enabled: !!studentId,
  });
}
