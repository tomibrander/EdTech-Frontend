"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BookOpen, Loader2, Plus, Users } from "lucide-react";

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
  useCreateCourse,
  courseCreateSchema,
  type CourseCreateValues,
} from "@/features/courses/hooks";

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
            <RoleGate roles={["superadmin"]}>
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

function NewCourseButton() {
  const [open, setOpen] = React.useState(false);
  const create = useCreateCourse();
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
      await create.mutateAsync(values);
      toast.success("Curso creado");
      setOpen(false);
      reset();
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
            <Label>ID del docente</Label>
            <Input placeholder="usr_TEACH1" {...register("teacherId")} />
            {errors.teacherId && (
              <p className="text-xs text-destructive">{errors.teacherId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input placeholder="Quinto año sección B - 2025" {...register("descriptionHeading")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
