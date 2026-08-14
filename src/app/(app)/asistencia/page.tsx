"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  History,
  Loader2,
  MessageSquare,
  Save,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourseStudents, useCourses } from "@/features/courses/hooks";
import { useAttendance, useSubmitAttendance } from "@/features/attendance/hooks";
import { useSession } from "@/features/auth/useSession";
import type { AttendanceStatus } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalRecord {
  status: AttendanceStatus;
  note: string;
  id?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    hoverClass: string;
    countClass: string;
  }
> = {
  presente: {
    label: "Presente",
    Icon: CheckCircle2,
    activeClass: "bg-success border-success text-success-foreground",
    hoverClass: "hover:border-success/50 hover:text-success",
    countClass: "text-success",
  },
  tarde: {
    label: "Tarde",
    Icon: Clock,
    activeClass: "bg-warning border-warning text-warning-foreground",
    hoverClass: "hover:border-warning/50 hover:text-warning-foreground",
    countClass: "text-warning-foreground",
  },
  ausente: {
    label: "Ausente",
    Icon: XCircle,
    activeClass: "bg-destructive/90 border-destructive text-destructive-foreground",
    hoverClass: "hover:border-destructive/50 hover:text-destructive",
    countClass: "text-destructive",
  },
};

const STATUSES = ["presente", "tarde", "ausente"] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const { role } = useSession();

  const [courseId, setCourseId] = React.useState(searchParams.get("courseId") ?? "");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = React.useState<Record<string, LocalRecord>>({});
  const [originalRecords, setOriginalRecords] = React.useState<Record<string, LocalRecord>>({});
  const [search, setSearch] = React.useState("");
  const [expandedNotes, setExpandedNotes] = React.useState<Set<string>>(new Set());

  // Tracks which courseId+date combo we've already initialized, to avoid
  // resetting in-progress edits when the query background-refreshes.
  const lastInitKeyRef = React.useRef("");

  const { data: courses } = useCourses();
  const { data: studentsData, isLoading: isLoadingStudents } = useCourseStudents(courseId);
  const existingQuery = useAttendance({
    courseId: courseId || undefined,
    from: date,
    to: date,
  });
  const submit = useSubmitAttendance();

  // ─── Initialize records when course or date changes ───────────────────────

  React.useEffect(() => {
    const key = `${courseId}||${date}`;
    const isNewSession = key !== lastInitKeyRef.current;
    const isReady = !!studentsData?.data.length && !existingQuery.isLoading;

    if (!isReady || !isNewSession) return;

    lastInitKeyRef.current = key;

    const init: Record<string, LocalRecord> = {};
    studentsData.data.forEach((s) => {
      const existing = existingQuery.data?.data.find((r) => r.studentId === s.id);
      init[s.id] = {
        status: existing?.status ?? "presente",
        note: existing?.note ?? "",
        id: existing?.id,
      };
    });
    setRecords(init);
    setOriginalRecords(init);
    setExpandedNotes(new Set());
  }, [courseId, date, studentsData, existingQuery.isLoading, existingQuery.data]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const isEditMode = (existingQuery.data?.data.length ?? 0) > 0;
  const students = studentsData?.data ?? [];
  const isLoading = isLoadingStudents || existingQuery.isLoading;
  const isDirector = role === "director" || role === "superadmin";

  const summary = React.useMemo(() => {
    const vals = Object.values(records);
    return {
      presente: vals.filter((r) => r.status === "presente").length,
      tarde: vals.filter((r) => r.status === "tarde").length,
      ausente: vals.filter((r) => r.status === "ausente").length,
      total: students.length,
    };
  }, [records, students.length]);

  const dirtyCount = React.useMemo(() => {
    if (!isEditMode) return 0;
    return Object.keys(records).filter((id) => {
      const curr = records[id];
      const orig = originalRecords[id];
      return !orig || curr.status !== orig.status || curr.note !== (orig.note ?? "");
    }).length;
  }, [records, originalRecords, isEditMode]);

  const filteredStudents = React.useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => s.displayName.toLowerCase().includes(q));
  }, [students, search]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const setStatus = (studentId: string, status: AttendanceStatus) =>
    setRecords((p) => ({ ...p, [studentId]: { ...p[studentId], status } }));

  const setNote = (studentId: string, note: string) =>
    setRecords((p) => ({ ...p, [studentId]: { ...p[studentId], note } }));

  const toggleNote = (studentId: string) =>
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });

  const markAll = (status: AttendanceStatus) =>
    setRecords((p) =>
      Object.fromEntries(Object.entries(p).map(([id, r]) => [id, { ...r, status }]))
    );

  async function onSave() {
    if (!courseId) return toast.error("Elegí un curso");
    if (!date) return toast.error("Elegí una fecha");
    try {
      await submit.mutateAsync({
        courseId,
        date,
        records: Object.entries(records).map(([studentId, r]) => ({
          studentId,
          status: r.status,
          note: r.note || undefined,
        })),
      });
      setOriginalRecords(records);
      toast.success(
        isEditMode && dirtyCount > 0
          ? `${dirtyCount} ${dirtyCount === 1 ? "registro actualizado" : "registros actualizados"}`
          : "Asistencia registrada"
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const canSave = !!courseId && !!date && students.length > 0;
  const saveDisabled = submit.isPending || (isEditMode && dirtyCount === 0);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <PageHeader
        title="Asistencia"
        eyebrow="Académico"
        description="Registro diario por curso"
        actions={
          <div className="flex gap-2">
            {isDirector && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/asistencia/historial">
                  <History className="h-4 w-4" />
                  Historial
                </Link>
              </Button>
            )}
            {canSave && (
              <Button onClick={onSave} disabled={saveDisabled} size="sm" className="gap-2">
                {submit.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditMode && dirtyCount > 0
                  ? `Guardar ${dirtyCount} ${dirtyCount === 1 ? "cambio" : "cambios"}`
                  : "Guardar asistencia"}
              </Button>
            )}
          </div>
        }
      />

      {/* ── Curso + Fecha ──────────────────────────────────── */}
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Curso</Label>
            <Select
              value={courseId}
              onValueChange={(v) => {
                setCourseId(v);
                setSearch("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegir curso" />
              </SelectTrigger>
              <SelectContent>
                {courses?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · {c.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Modo badge — solo cuando hay datos */}
          {courseId && !isLoading && students.length > 0 && (
            <Badge
              variant={isEditMode ? "warning" : "success"}
              className="h-9 items-center justify-center self-end px-3 text-xs"
            >
              {isEditMode ? "✎ Editando registro" : "✦ Registro nuevo"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* ── Estado principal ───────────────────────────────── */}
      {!courseId ? (
        <EmptyState
          title="Elegí un curso"
          description="Seleccioná un curso y una fecha para comenzar."
        />
      ) : isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <EmptyState title="El curso no tiene alumnos" />
      ) : (
        <>
          {/* ── Barra de resumen ─── */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                {STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <span key={s} className="flex items-center gap-1.5 text-sm">
                      <cfg.Icon className={cn("h-4 w-4", cfg.countClass)} />
                      <span className={cn("font-semibold num-mono", cfg.countClass)}>
                        {summary[s]}
                      </span>
                      <span className="text-muted-foreground">{cfg.label.toLowerCase()}s</span>
                    </span>
                  );
                })}
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {summary.total} alumnos
                </span>
              </div>

              {/* Barra segmentada */}
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {summary.total > 0 && (
                  <>
                    <div
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${(summary.presente / summary.total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-warning transition-all duration-500"
                      style={{ width: `${(summary.tarde / summary.total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-destructive transition-all duration-500"
                      style={{ width: `${(summary.ausente / summary.total) * 100}%` }}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Acciones rápidas ─── */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll("presente")}
              className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Todos presentes
            </Button>
          </div>

          {/* ── Lista de alumnos ─── */}
          <Card>
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <EmptyState
                  title="Sin resultados"
                  description={`No hay alumnos que coincidan con "${search}"`}
                  className="border-none py-10"
                />
              ) : (
                <ul className="divide-y">
                  {filteredStudents.map((s) => {
                    const r = records[s.id] ?? {
                      status: "presente" as AttendanceStatus,
                      note: "",
                    };
                    const noteOpen = expandedNotes.has(s.id);
                    const isDirty =
                      isEditMode &&
                      (r.status !== originalRecords[s.id]?.status ||
                        r.note !== (originalRecords[s.id]?.note ?? ""));

                    return (
                      <li key={s.id}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 transition-colors",
                            isDirty && "bg-warning/5"
                          )}
                        >
                          {/* Avatar */}
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {getInitials(s.displayName)}
                          </div>

                          {/* Nombre */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.displayName}</p>
                            {isDirty && (
                              <p className="text-[11px] text-warning-foreground">modificado</p>
                            )}
                          </div>

                          {/* Botones de estado */}
                          <div className="flex flex-shrink-0 gap-1.5">
                            {STATUSES.map((status) => {
                              const cfg = STATUS_CONFIG[status];
                              const active = r.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setStatus(s.id, status)}
                                  className={cn(
                                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all",
                                    active
                                      ? cfg.activeClass
                                      : cn("border-border text-muted-foreground", cfg.hoverClass)
                                  )}
                                >
                                  <cfg.Icon className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{cfg.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Toggle nota */}
                          <button
                            type="button"
                            onClick={() => toggleNote(s.id)}
                            title={noteOpen ? "Cerrar nota" : "Agregar nota"}
                            className={cn(
                              "flex-shrink-0 rounded-md p-1.5 transition-colors",
                              noteOpen || r.note
                                ? "text-primary"
                                : "text-muted-foreground/40 hover:text-muted-foreground"
                            )}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Nota expandible */}
                        {(noteOpen || r.note) && (
                          <div className="border-t bg-muted/20 px-4 py-2.5 pl-[52px]">
                            <Input
                              autoFocus={noteOpen && !r.note}
                              placeholder="Nota opcional (ej: avisó la familia, llegó sin guardapolvo...)"
                              value={r.note}
                              onChange={(e) => setNote(s.id, e.target.value)}
                              className="h-8 bg-background text-sm"
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* ── Footer de la card: resumen + guardar ── */}
              {students.length > 0 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="num-mono font-medium text-foreground">
                      {summary.presente}P · {summary.tarde}T · {summary.ausente}A
                    </span>
                    {isEditMode && dirtyCount > 0 && (
                      <Badge variant="warning">
                        {dirtyCount} {dirtyCount === 1 ? "cambio" : "cambios"}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={onSave}
                    disabled={saveDisabled}
                    className="gap-2"
                  >
                    {submit.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isEditMode && dirtyCount > 0
                      ? `Guardar ${dirtyCount} ${dirtyCount === 1 ? "cambio" : "cambios"}`
                      : isEditMode
                      ? "Sin cambios"
                      : "Guardar asistencia"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
