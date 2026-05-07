"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  BookOpen,
  FileSpreadsheet,
  Loader2,
  Plus,
  Users,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/data/EmptyState";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  useCourses,
  useBulkUpsertCourses,
  useStudentSuggestions,
  courseCreateSchema,
  type CourseCreateValues,
} from "@/features/courses/hooks";
import {
  useTeacherSuggestions,
  type AppUser,
} from "@/features/users/hooks";
import type { Student } from "@/types";

export default function CoursesListPage() {
  const [year, setYear] = React.useState<number | undefined>(new Date().getFullYear());
  const { data, isLoading } = useCourses(year);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Cursos creados en el sistema"
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-28"
              value={year ?? ""}
              onChange={(e) =>
                setYear(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Año"
            />
            <RoleGate roles={["superadmin", "director"]} fallback={null}>
              <BulkCoursesButton />
            </RoleGate>
            <RoleGate roles={["superadmin", "director"]} fallback={null}>
              <NewCourseButton />
            </RoleGate>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((c) => (
            <Card
              key={c.id}
              className="transition-shadow hover:shadow-md focus-within:shadow-md"
            >
              <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {c.year}
                    </span>
                  </div>
                  <Link
                    href={`/cursos/${c.id}`}
                    className="mt-1 block text-lg font-semibold hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  {c.teacherName && (
                    <p className="text-sm text-muted-foreground">{c.teacherName}</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {c.studentCount ?? 0} alumnos
                  </span>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/cursos/${c.id}`}>Ver curso</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin cursos" description="Todavía no hay cursos cargados." />
      )}
    </div>
  );
}

function BulkCoursesButton() {
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const bulk = useBulkUpsertCourses();

  const onSubmit = async () => {
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) {
      toast.error("Pegá al menos una línea");
      return;
    }

    try {
      const courses = lines.map((line, idx) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length < 2) {
          throw new Error(
            `Línea ${idx + 1}: formato inválido. Usá name|year|grade|division|teacherIds|studentIds`,
          );
        }
        const [
          name,
          yearRaw,
          gradeLevelRaw,
          divisionRaw,
          teacherIdsRaw,
          studentIdsRaw,
        ] = parts;
        const year = Number(yearRaw);
        if (!Number.isFinite(year)) {
          throw new Error(`Línea ${idx + 1}: año inválido`);
        }
        return {
          name,
          year,
          gradeLevel: gradeLevelRaw || undefined,
          division: divisionRaw || undefined,
          teacherIds: teacherIdsRaw
            ? teacherIdsRaw.split(",").map((v) => v.trim()).filter(Boolean)
            : [],
          studentIds: studentIdsRaw
            ? studentIdsRaw.split(",").map((v) => v.trim()).filter(Boolean)
            : [],
        };
      });

      const res = await bulk.mutateAsync(courses);
      const missing = res.data.reduce(
        (acc, item) => acc + item.missingStudentIds.length,
        0,
      );
      toast.success(
        `Carga completa. Creados: ${res.created}, actualizados: ${res.updated}${missing ? `, alumnos no encontrados: ${missing}` : ""}`,
      );
      setOpen(false);
      setRaw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos cargar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="h-4 w-4" /> Carga masiva
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carga masiva de cursos</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Formato por línea</Label>
          <p className="text-xs text-muted-foreground">
            name|year|gradeLevel|division|teacherIds(coma)|studentIds(coma)
          </p>
          <p className="text-xs text-muted-foreground">
            Ejemplo: 5to B|2026|5to|B|usr_DOC1,usr_DOC2|usr_AL1,usr_AL2
          </p>
          <textarea
            className="min-h-[180px] w-full rounded-md border border-input bg-background p-3 text-sm"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="5to A|2026|5to|A|usr_DOC1|usr_AL1,usr_AL2&#10;5to B|2026|5to|B|usr_DOC2|usr_AL3,usr_AL4"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={bulk.isPending}>
            {bulk.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewCourseButton() {
  const [open, setOpen] = React.useState(false);
  const bulk = useBulkUpsertCourses();
  const [teacherQuery, setTeacherQuery] = React.useState("");
  const [studentQuery, setStudentQuery] = React.useState("");
  const [selectedTeachers, setSelectedTeachers] = React.useState<AppUser[]>([]);
  const [selectedStudents, setSelectedStudents] = React.useState<Student[]>([]);
  const { data: teacherSuggestions = [], isFetching: loadingTeachers } =
    useTeacherSuggestions(teacherQuery);
  const { data: studentSuggestions = [], isFetching: loadingStudents } =
    useStudentSuggestions(studentQuery);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseCreateValues>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: { year: new Date().getFullYear() },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await bulk.mutateAsync([
        {
          name: values.name,
          year: values.year,
          gradeLevel: values.name.split(" ")[0] || undefined,
          division: values.section || undefined,
          description: values.descriptionHeading || undefined,
          teacherIds: selectedTeachers.map((t) => t.id),
          homeroomTeacherId: selectedTeachers[0]?.id,
          studentIds: selectedStudents.map((s) => s.id),
        },
      ]);
      toast.success("Curso creado");
      setOpen(false);
      reset();
      setTeacherQuery("");
      setStudentQuery("");
      setSelectedTeachers([]);
      setSelectedStudents([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos crear");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nuevo curso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo curso</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input placeholder="Ej: 5to B" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Año</Label>
              <Input type="number" {...register("year")} />
            </div>
            <div className="space-y-2">
              <Label>Sección</Label>
              <Input placeholder="B" {...register("section")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Docentes</Label>
            <Input
              placeholder="Buscar docente por nombre o email"
              value={teacherQuery}
              onChange={(e) => setTeacherQuery(e.target.value)}
            />
            <SuggestionList<AppUser>
              items={teacherSuggestions.filter(
                (t) => !selectedTeachers.some((s) => s.id === t.id),
              )}
              loading={loadingTeachers}
              getKey={(t) => t.id}
              renderLabel={(t) => `${t.displayName} (${t.email})`}
              onSelect={(t) => {
                setSelectedTeachers((prev) => [...prev, t]);
                setTeacherQuery("");
              }}
            />
            <SelectedPills
              items={selectedTeachers}
              getKey={(t) => t.id}
              renderLabel={(t) => `${t.displayName}`}
              onRemove={(id) =>
                setSelectedTeachers((prev) => prev.filter((t) => t.id !== id))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Alumnos</Label>
            <Input
              placeholder="Buscar alumno por nombre o email"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
            <SuggestionList<Student>
              items={studentSuggestions.filter(
                (s) => !selectedStudents.some((x) => x.id === s.id),
              )}
              loading={loadingStudents}
              getKey={(s) => s.id}
              renderLabel={(s) => `${s.displayName} (${s.institutionalEmail})`}
              onSelect={(s) => {
                setSelectedStudents((prev) => [...prev, s]);
                setStudentQuery("");
              }}
            />
            <SelectedPills
              items={selectedStudents}
              getKey={(s) => s.id}
              renderLabel={(s) => `${s.displayName}`}
              onRemove={(id) =>
                setSelectedStudents((prev) => prev.filter((s) => s.id !== id))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input placeholder="Quinto año sección B - 2025" {...register("descriptionHeading")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={bulk.isPending}>
              {bulk.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SuggestionList<T>({
  items,
  loading,
  getKey,
  renderLabel,
  onSelect,
}: {
  items: T[];
  loading: boolean;
  getKey: (item: T) => string;
  renderLabel: (item: T) => string;
  onSelect: (item: T) => void;
}) {
  if (loading) {
    return <p className="text-xs text-muted-foreground">Buscando…</p>;
  }
  if (!items.length) return null;
  return (
    <div className="max-h-36 overflow-auto rounded-md border">
      {items.map((item) => (
        <button
          key={getKey(item)}
          type="button"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
          onClick={() => onSelect(item)}
        >
          {renderLabel(item)}
        </button>
      ))}
    </div>
  );
}

function SelectedPills<T>({
  items,
  getKey,
  renderLabel,
  onRemove,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderLabel: (item: T) => string;
  onRemove: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const id = getKey(item);
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full border bg-accent px-2 py-1 text-xs"
          >
            {renderLabel(item)}
            <button type="button" onClick={() => onRemove(id)} aria-label="Quitar">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
