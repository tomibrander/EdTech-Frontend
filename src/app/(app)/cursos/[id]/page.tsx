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
  useCourseStudents,
  useRemoveStudentFromCourse,
  useStudentSuggestions,
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
                toast.error(err instanceof Error ? err.message : "Error");
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
