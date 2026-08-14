"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipboardList, GraduationCap, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCourse, useLinkClassroomCourse } from "@/features/courses/hooks";
import { useClassroomCourses } from "@/features/classroom/hooks";
import { getApiErrorMessage } from "@/lib/api/client";

export function ClassroomLinkCard({ courseId }: { courseId: string }) {
  const { data: course } = useCourse(courseId);
  const { data: classroomCourses } = useClassroomCourses();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const linkedCourse = classroomCourses?.find(
    (c) => c.id === course?.classroomCourseId,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Classroom</CardTitle>
      </CardHeader>
      <CardContent>
        {course?.classroomCourseId ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                {linkedCourse?.name ?? course.classroomCourseId}
              </p>
              <p className="text-xs text-muted-foreground">
                Las tareas y calificaciones de este curso se toman de esa
                materia de Classroom.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/classroom/cursos/${course.classroomCourseId}/tareas`}>
                  <ClipboardList className="h-4 w-4" /> Tareas
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/classroom/cursos/${course.classroomCourseId}/calificaciones`}
                >
                  <GraduationCap className="h-4 w-4" /> Notas
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Este curso todavía no está vinculado a una materia de Google
              Classroom — no vas a poder cargar tareas ni notas hasta
              vincularlo.
            </p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Vincular a Classroom
            </Button>
          </div>
        )}
      </CardContent>
      <ClassroomLinkDialog
        courseId={courseId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}

export function ClassroomLinkDialog({
  courseId,
  open,
  onOpenChange,
}: {
  courseId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: classroomCourses } = useClassroomCourses();
  const [selectedId, setSelectedId] = React.useState("");
  const link = useLinkClassroomCourse(courseId);

  function handleClose(v: boolean) {
    if (!v) setSelectedId("");
    onOpenChange(v);
  }

  async function handleLink() {
    if (!selectedId) return;
    try {
      await link.mutateAsync(selectedId);
      toast.success("Curso vinculado a Classroom");
      handleClose(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular a Google Classroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Elegí una materia de Classroom</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Seleccionar…</option>
            {classroomCourses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` — ${c.section}` : ""}
              </option>
            ))}
          </select>
          {classroomCourses?.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay materias de Classroom visibles para tu cuenta. Verificá
              que exista el curso en Google Classroom y que tengas acceso.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLink} disabled={link.isPending || !selectedId}>
            {link.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
