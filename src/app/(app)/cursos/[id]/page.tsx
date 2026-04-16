"use client";
import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/data/EmptyState";
import {
  useAddStudentToCourse,
  useCourseStudents,
  useRemoveStudentFromCourse,
} from "@/features/courses/hooks";
import { getInitials } from "@/lib/utils";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useCourseStudents(id);
  const remove = useRemoveStudentFromCourse(id);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/cursos">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>
      <PageHeader
        title={`Curso ${id}`}
        description="Alumnos inscriptos al curso"
        actions={<AddStudentDialog courseId={id} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Alumnos ({data?.data.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data && data.data.length > 0 ? (
            <ul className="divide-y">
              {data.data.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <Link
                    href={`/alumnos/${s.id}`}
                    className="flex items-center gap-3 hover:text-primary"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(s.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{s.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.institutionalEmail}
                      </p>
                    </div>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Quitar a ${s.displayName} del curso?`)) return;
                      try {
                        await remove.mutateAsync(s.id);
                        toast.success("Alumno quitado");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Error");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="El curso no tiene alumnos" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddStudentDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = React.useState(false);
  const [studentId, setStudentId] = React.useState("");
  const add = useAddStudentToCourse(courseId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Agregar alumno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar alumno al curso</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>ID del alumno</Label>
          <Input
            placeholder="usr_0ZLUQ"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Se llama a courses.students.create en Google Classroom.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!studentId.trim()) return;
              try {
                await add.mutateAsync(studentId);
                toast.success("Alumno agregado");
                setStudentId("");
                setOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Error");
              }
            }}
            disabled={add.isPending}
          >
            {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
