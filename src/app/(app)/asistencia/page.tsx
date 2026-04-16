"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, Save, XCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { useCourseStudents, useCourses } from "@/features/courses/hooks";
import { useSubmitAttendance } from "@/features/attendance/hooks";
import type { AttendanceStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: {
  key: AttendanceStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  cls: string;
}[] = [
  { key: "presente", label: "Presente", icon: CheckCircle2, cls: "border-success text-success" },
  { key: "ausente", label: "Ausente", icon: XCircle, cls: "border-destructive text-destructive" },
  { key: "tarde", label: "Tarde", icon: Clock, cls: "border-warning text-warning-foreground" },
];

export default function AttendancePage() {
  const search = useSearchParams();
  const initialCourseId = search.get("courseId") ?? "";
  const [courseId, setCourseId] = React.useState(initialCourseId);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const { data: courses } = useCourses();
  const { data: studentsData, isLoading } = useCourseStudents(courseId);

  const [records, setRecords] = React.useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});

  React.useEffect(() => {
    const defaults: typeof records = {};
    studentsData?.data.forEach((s) => {
      defaults[s.id] = records[s.id] ?? { status: "presente", note: "" };
    });
    setRecords(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsData?.data.length, courseId]);

  const submit = useSubmitAttendance();

  async function onSave() {
    if (!courseId) return toast.error("Elegí un curso");
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
      toast.success("Asistencia registrada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos guardar");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asistencia"
        description="Registro diario por curso"
        actions={
          <Button onClick={onSave} disabled={submit.isPending || !courseId}>
            {submit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar asistencia
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Curso</Label>
            <Select value={courseId} onValueChange={setCourseId}>
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
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {!courseId ? (
            <EmptyState
              title="Elegí un curso"
              description="Seleccioná un curso y fecha para empezar."
              className="border-none py-16"
            />
          ) : isLoading ? (
            <div className="p-4">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : studentsData && studentsData.data.length > 0 ? (
            <ul className="divide-y">
              {studentsData.data.map((s) => {
                const r = records[s.id] ?? { status: "presente" as AttendanceStatus, note: "" };
                return (
                  <li key={s.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <p className="font-medium">{s.displayName}</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = r.status === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() =>
                              setRecords((p) => ({
                                ...p,
                                [s.id]: { ...r, status: opt.key },
                              }))
                            }
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                              active
                                ? opt.cls + " bg-accent/30"
                                : "border-border text-muted-foreground hover:bg-accent/30"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <Input
                      placeholder="Nota (opcional)"
                      value={r.note}
                      onChange={(e) =>
                        setRecords((p) => ({
                          ...p,
                          [s.id]: { ...r, note: e.target.value },
                        }))
                      }
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="El curso no tiene alumnos" className="border-none py-16" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
