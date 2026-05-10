"use client";
import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  Filter,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AttendanceAuditEntry, AttendanceStatus } from "@/types";
import { cn, formatDateTime, getInitials } from "@/lib/utils";

// ─── Placeholder data ─────────────────────────────────────────────────────────
//
// Contrato acordado con backend. Cuando el endpoint GET /attendance/logs
// esté disponible, reemplazar con useAttendanceLogs() del hook ya preparado.

const PLACEHOLDER: AttendanceAuditEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-05-09T14:32:00Z",
    userId: "u-2",
    userDisplayName: "María López",
    userRole: "docente",
    action: "attendance.update",
    recordId: "rec-11",
    courseId: "c-3",
    courseName: "3ro A",
    date: "2026-05-09",
    studentId: "s-1",
    studentName: "Valentina García",
    before: { status: "presente" },
    after: { status: "ausente", note: "Avisaron desde la familia" },
  },
  {
    id: "log-2",
    timestamp: "2026-05-09T13:10:00Z",
    userId: "u-3",
    userDisplayName: "Carlos Gómez",
    userRole: "docente",
    action: "attendance.update",
    recordId: "rec-28",
    courseId: "c-1",
    courseName: "1ro A",
    date: "2026-05-09",
    studentId: "s-4",
    studentName: "Lucas Martínez",
    before: { status: "tarde" },
    after: { status: "presente" },
  },
  {
    id: "log-3",
    timestamp: "2026-05-09T08:05:00Z",
    userId: "u-2",
    userDisplayName: "María López",
    userRole: "docente",
    action: "attendance.create",
    recordId: "rec-30",
    courseId: "c-3",
    courseName: "3ro A",
    date: "2026-05-09",
    studentId: "s-7",
    studentName: "Sofía Romero",
    before: null,
    after: { status: "presente" },
  },
  {
    id: "log-4",
    timestamp: "2026-05-08T15:47:00Z",
    userId: "u-4",
    userDisplayName: "Ana Fernández",
    userRole: "docente",
    action: "attendance.update",
    recordId: "rec-55",
    courseId: "c-2",
    courseName: "2do B",
    date: "2026-05-08",
    studentId: "s-12",
    studentName: "Marcos Pérez",
    before: { status: "ausente" },
    after: { status: "tarde", note: "Llegó a la segunda hora" },
  },
  {
    id: "log-5",
    timestamp: "2026-05-08T08:12:00Z",
    userId: "u-3",
    userDisplayName: "Carlos Gómez",
    userRole: "docente",
    action: "attendance.create",
    recordId: "rec-50",
    courseId: "c-1",
    courseName: "1ro A",
    date: "2026-05-08",
    studentId: "s-2",
    studentName: "Camila Torres",
    before: null,
    after: { status: "presente" },
  },
  {
    id: "log-6",
    timestamp: "2026-05-07T09:30:00Z",
    userId: "u-4",
    userDisplayName: "Ana Fernández",
    userRole: "docente",
    action: "attendance.update",
    recordId: "rec-41",
    courseId: "c-2",
    courseName: "2do B",
    date: "2026-05-07",
    studentId: "s-9",
    studentName: "Tomás Ríos",
    before: { status: "presente" },
    after: { status: "ausente" },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  presente: "Presente",
  tarde: "Tarde",
  ausente: "Ausente",
};

const STATUS_VARIANT: Record<
  AttendanceStatus,
  "success" | "warning" | "destructive"
> = {
  presente: "success",
  tarde: "warning",
  ausente: "destructive",
};

function StatusPill({ status }: { status: AttendanceStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="text-[11px]">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendanceHistorialPage() {
  const [courseFilter, setCourseFilter] = React.useState("todos");
  const [fromDate, setFromDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [docenteFilter, setDocenteFilter] = React.useState("todos");

  // Apply client-side filters to placeholder data
  const filtered = React.useMemo(() => {
    return PLACEHOLDER.filter((e) => {
      if (courseFilter !== "todos" && e.courseId !== courseFilter) return false;
      if (docenteFilter !== "todos" && e.userId !== docenteFilter) return false;
      if (e.date < fromDate || e.date > toDate) return false;
      return true;
    });
  }, [courseFilter, fromDate, toDate, docenteFilter]);

  const uniqueCourses = React.useMemo(() => {
    const map = new Map<string, string>();
    PLACEHOLDER.forEach((e) => map.set(e.courseId, e.courseName));
    return Array.from(map.entries());
  }, []);

  const uniqueDocentes = React.useMemo(() => {
    const map = new Map<string, string>();
    PLACEHOLDER.forEach((e) => map.set(e.userId, e.userDisplayName));
    return Array.from(map.entries());
  }, []);

  return (
    <RoleGate roles={["director", "superadmin"]}>
      <div className="space-y-6">
        <PageHeader
          title="Historial de cambios"
          eyebrow="Asistencia"
          description="Auditoría de modificaciones a registros de asistencia. Cada fila registra quién, qué y cuándo."
          actions={
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs text-warning-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              Datos de placeholder — conectar a{" "}
              <code className="font-mono">GET /attendance/logs</code>
            </div>
          }
        />

        {/* ── Filtros ─────────────────────────────────────── */}
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Desde
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los cursos</SelectItem>
                  {uniqueCourses.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Docente</Label>
              <Select value={docenteFilter} onValueChange={setDocenteFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {uniqueDocentes.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabla de log ─────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "entrada" : "entradas"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                title="Sin registros"
                description="No hay cambios para el período y filtros seleccionados."
                className="border-none py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Fecha / hora
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Alumno
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Curso
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Cambio
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Nota
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Docente
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((entry) => (
                      <tr
                        key={entry.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        {/* Timestamp */}
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(entry.timestamp)}
                        </td>

                        {/* Alumno */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                              {getInitials(entry.studentName)}
                            </div>
                            <span className="font-medium">{entry.studentName}</span>
                          </div>
                        </td>

                        {/* Curso */}
                        <td className="px-4 py-3 text-muted-foreground">
                          {entry.courseName}
                        </td>

                        {/* Cambio: before → after */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {entry.before ? (
                              <StatusPill status={entry.before.status} />
                            ) : (
                              <Badge variant="muted" className="text-[11px]">
                                Nuevo
                              </Badge>
                            )}
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <StatusPill status={entry.after.status} />
                          </div>
                        </td>

                        {/* Nota */}
                        <td className="max-w-[200px] px-4 py-3">
                          {entry.after.note ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {entry.after.note}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Docente */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {getInitials(entry.userDisplayName)}
                            </div>
                            <span className="text-xs">{entry.userDisplayName}</span>
                          </div>
                        </td>

                        {/* Acción */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              entry.action === "attendance.create"
                                ? "default"
                                : "outline"
                            }
                            className="text-[11px]"
                          >
                            {entry.action === "attendance.create"
                              ? "Creación"
                              : "Edición"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Nota arquitectural ──────────────────────────── */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Contrato backend acordado
            </p>
            <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
              <p>
                <span className="text-primary">GET</span> /attendance/logs
              </p>
              <p className="pl-4">
                params: courseId?, from?, to?, userId?, page?, limit?
              </p>
              <p className="pl-4">
                returns: Paginated&lt;AttendanceAuditEntry&gt;
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground/60">
                  Partition key (Cassandra): (courseId, date)
                </span>
              </p>
              <p>
                <span className="text-muted-foreground/60">
                  Clustering key: timestamp DESC
                </span>
              </p>
              <p>
                <span className="text-muted-foreground/60">
                  TTL sugerido: 2 años (63072000s)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
