"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipboardList, GraduationCap, Loader2, Plus, X } from "lucide-react";

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
import {
  useAddClassroomLink,
  useCourse,
  useRemoveClassroomLink,
} from "@/features/courses/hooks";
import { useClassroomCourses } from "@/features/classroom/hooks";
import { getApiErrorMessage } from "@/lib/api/client";

export function ClassroomLinkCard({ courseId }: { courseId: string }) {
  const { data: course } = useCourse(courseId);
  const { data: classroomCourses } = useClassroomCourses();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const remove = useRemoveClassroomLink(courseId);

  const linkedIds = course?.classroomCourseIds ?? [];
  const linkedCourses = linkedIds.map((id) => ({
    id,
    course: classroomCourses?.find((c) => c.id === id),
  }));

  async function handleRemove(classroomCourseId: string) {
    try {
      await remove.mutateAsync(classroomCourseId);
      toast.success("Materia desvinculada");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Classroom</CardTitle>
        {linkedIds.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Agregar materia
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {linkedIds.length > 0 ? (
          <ul className="divide-y">
            {linkedCourses.map(({ id, course: c }) => (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <p className="text-sm font-medium">{c?.name ?? id}</p>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${id}/tareas`}>
                      <ClipboardList className="h-4 w-4" /> Tareas
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${id}/calificaciones`}>
                      <GraduationCap className="h-4 w-4" /> Notas
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={remove.isPending}
                    onClick={() => handleRemove(id)}
                    aria-label="Desvincular"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Este curso todavía no tiene ninguna materia de Google Classroom
              vinculada — no vas a poder cargar tareas ni notas hasta
              vincular al menos una.
            </p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Vincular materia
            </Button>
          </div>
        )}
      </CardContent>
      <ClassroomLinkDialog
        courseId={courseId}
        linkedIds={linkedIds}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}

export function ClassroomLinkDialog({
  courseId,
  linkedIds,
  open,
  onOpenChange,
}: {
  courseId: string;
  linkedIds: string[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: classroomCourses } = useClassroomCourses();
  const [selectedId, setSelectedId] = React.useState("");
  const link = useAddClassroomLink(courseId);

  const available = (classroomCourses ?? []).filter(
    (c) => !linkedIds.includes(c.id),
  );

  function handleClose(v: boolean) {
    if (!v) setSelectedId("");
    onOpenChange(v);
  }

  async function handleLink() {
    if (!selectedId) return;
    try {
      await link.mutateAsync(selectedId);
      toast.success("Materia vinculada");
      handleClose(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular materia de Google Classroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Elegí una materia de Classroom</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Seleccionar…</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` — ${c.section}` : ""}
              </option>
            ))}
          </select>
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay más materias de Classroom visibles para tu cuenta (o ya
              están todas vinculadas). Verificá que exista el curso en Google
              Classroom y que tengas acceso.
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
