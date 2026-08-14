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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useAddStudentToCourse,
  useCourse,
  useCourseStudents,
  useCreateCourseGroup,
  useLinkCourseGroup,
  useRemoveStudentFromCourse,
  useStudentSuggestions,
} from "@/features/courses/hooks";
import { useGroups } from "@/features/workspace/hooks";
import { getInitials } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/client";
import { ClassroomLinkCard } from "./ClassroomLinkCard";

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

      <CourseGroupCard courseId={id} />
      <ClassroomLinkCard courseId={id} />

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
                        toast.error(getApiErrorMessage(err));
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

function CourseGroupCard({ courseId }: { courseId: string }) {
  const { data: course } = useCourse(courseId);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grupo de Google</CardTitle>
      </CardHeader>
      <CardContent>
        {course?.workspaceGroupEmail ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{course.workspaceGroupEmail}</p>
              <p className="text-xs text-muted-foreground">
                Los alumnos del curso se sincronizan automáticamente con este grupo.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Este curso todavía no tiene un grupo de Google vinculado.
            </p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Vincular grupo
            </Button>
          </div>
        )}
      </CardContent>
      <GroupLinkDialog courseId={courseId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </Card>
  );
}

function GroupLinkDialog({
  courseId,
  open,
  onOpenChange,
}: {
  courseId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const { data: groups } = useGroups();
  const [selectedEmail, setSelectedEmail] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const link = useLinkCourseGroup(courseId);
  const create = useCreateCourseGroup(courseId);

  function handleClose(v: boolean) {
    if (!v) {
      setSelectedEmail("");
      setNewEmail("");
      setNewName("");
    }
    onOpenChange(v);
  }

  async function handleLink() {
    if (!selectedEmail) return;
    try {
      await link.mutateAsync(selectedEmail);
      toast.success("Grupo vinculado, sincronizando alumnos…");
      handleClose(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleCreate() {
    if (!newEmail.trim()) return;
    try {
      await create.mutateAsync({ email: newEmail.trim(), name: newName.trim() || undefined });
      toast.success("Grupo creado y vinculado");
      handleClose(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular grupo de Google</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "existing" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("existing")}
          >
            Grupo existente
          </Button>
          <Button
            type="button"
            variant={mode === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("new")}
          >
            Crear nuevo
          </Button>
        </div>

        {mode === "existing" ? (
          <div className="space-y-2">
            <Label>Elegí un grupo</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {groups?.map((g) => (
                <option key={g.googleGroupId} value={g.email}>
                  {g.name || g.email}
                </option>
              ))}
            </select>
            {groups?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay grupos en el dominio todavía. Creá uno nuevo.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Email del grupo nuevo</Label>
            <Input
              type="email"
              placeholder="1a-2026@tudominio.edu.ar"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Label>Nombre (opcional)</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Se crea con los alumnos actuales del curso como miembros iniciales.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          {mode === "existing" ? (
            <Button onClick={handleLink} disabled={link.isPending || !selectedEmail}>
              {link.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Vincular
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={create.isPending || !newEmail.trim()}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear y vincular
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddStudentDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ id: string; displayName: string } | null>(
    null
  );
  const add = useAddStudentToCourse(courseId);
  const { data: currentStudents } = useCourseStudents(courseId);
  const { data: suggestions, isFetching } = useStudentSuggestions(searchQuery);

  const enrolledIds = new Set(currentStudents?.data.map((s) => s.id) ?? []);
  const results = (suggestions ?? []).filter((s) => !enrolledIds.has(s.id));

  function handleClose(v: boolean) {
    if (!v) {
      setSearchQuery("");
      setSelected(null);
    }
    setOpen(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <Label>Alumno</Label>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-left"
              >
                {selected ? (
                  <span>{selected.displayName}</span>
                ) : (
                  <span className="text-muted-foreground">Buscar por nombre…</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <Input
                placeholder="Nombre del alumno…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="mt-2 max-h-48 overflow-y-auto">
                {isFetching && (
                  <p className="py-2 text-center text-xs text-muted-foreground">Buscando…</p>
                )}
                {!isFetching && searchQuery.trim().length >= 2 && results.length === 0 && (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    Sin resultados
                  </p>
                )}
                {results.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      setSelected({ id: s.id, displayName: s.displayName });
                      setSearchOpen(false);
                    }}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(s.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{s.displayName}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {s.courseName}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!selected) return;
              try {
                await add.mutateAsync(selected.id);
                toast.success("Alumno agregado");
                handleClose(false);
              } catch (err) {
                toast.error(getApiErrorMessage(err));
              }
            }}
            disabled={add.isPending || !selected}
          >
            {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
