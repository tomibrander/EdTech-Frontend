"use client";
import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/data/EmptyState";
import {
  useCourseGrades,
  useCourseWork,
  useSubmitGrades,
} from "@/features/classroom/hooks";

export default function GradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: work } = useCourseWork(id, "all");
  const [workId, setWorkId] = React.useState<string>("");
  const { data: grades, isLoading } = useCourseGrades(id, workId || undefined);
  const submit = useSubmitGrades(id);

  const [values, setValues] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (!grades) return;
    const next: Record<string, string> = {};
    grades.data.forEach((g) => {
      next[g.studentId] = String(g.grade ?? "");
    });
    setValues(next);
  }, [grades, workId]);

  async function onSave() {
    if (!workId) return toast.error("Elegí un trabajo");
    const payload = Object.entries(values)
      .map(([studentId, v]) => ({ studentId, grade: Number(v) }))
      .filter((r) => !Number.isNaN(r.grade));
    try {
      await submit.mutateAsync({ workId, grades: payload });
      toast.success(`Cargadas ${payload.length} notas`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function onBulkUpload(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed: Record<string, string> = {};
    for (const line of lines) {
      const [studentId, grade] = line.split(",").map((s) => s.trim());
      if (studentId && grade) parsed[studentId] = grade;
    }
    setValues((p) => ({ ...p, ...parsed }));
    toast.success(`Cargadas ${Object.keys(parsed).length} filas desde el CSV`);
  }

  const maxPoints = work?.data.find((w) => w.id === workId)?.maxPoints;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/classroom">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>
      <PageHeader
        title="Calificaciones"
        description={`Materia ${id}`}
        actions={
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onBulkUpload(file);
                }}
              />
            </label>
            <Button onClick={onSave} disabled={!workId || submit.isPending}>
              {submit.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="max-w-md space-y-2">
            <Label>Trabajo</Label>
            <Select value={workId} onValueChange={setWorkId}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí una tarea o examen" />
              </SelectTrigger>
              <SelectContent>
                {work?.data.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.type === "exam" ? "[EXAMEN] " : ""}
                    {w.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Formato CSV: <code>studentId,nota</code> por línea.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        {!workId ? (
          <EmptyState
            title="Elegí un trabajo para cargar notas"
            className="border-none py-16"
          />
        ) : isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : grades && grades.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-40">
                  Nota {maxPoints ? `(máx ${maxPoints})` : ""}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.data.map((g) => (
                <TableRow key={g.studentId}>
                  <TableCell className="font-medium">
                    {g.studentName ?? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {g.studentId}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {g.state ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      max={maxPoints}
                      value={values[g.studentId] ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [g.studentId]: e.target.value }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState title="Sin alumnos para calificar" className="border-none py-16" />
        )}
      </Card>
    </div>
  );
}
