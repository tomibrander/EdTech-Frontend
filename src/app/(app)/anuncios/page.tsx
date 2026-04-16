"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Megaphone, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
  useAnnouncements,
  useCreateAnnouncement,
} from "@/features/messages/hooks";
import { formatDateTime, fromNow } from "@/lib/utils";

export default function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anuncios"
        description="Novedades, notas y avisos generales"
        actions={
          <RoleGate roles={["superadmin", "director", "docente"]}>
            <NewAnnouncementDialog />
          </RoleGate>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="h-4 w-4 text-primary" /> {a.title}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.author} · {fromNow(a.publishedAt ?? a.publishAt)}
                  </p>
                </div>
                {a.visibleUntil && (
                  <p className="text-xs text-muted-foreground">
                    Visible hasta {formatDateTime(a.visibleUntil)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{a.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Megaphone} title="No hay anuncios" />
      )}
    </div>
  );
}

function NewAnnouncementDialog() {
  const [open, setOpen] = React.useState(false);
  const create = useCreateAnnouncement();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    title: string;
    body: string;
    courseId?: string;
    publishAt?: string;
    visibleUntil?: string;
    audienceAlumnos: boolean;
    audiencePadres: boolean;
    audienceDocentes: boolean;
  }>({
    defaultValues: {
      audienceAlumnos: true,
      audiencePadres: true,
      audienceDocentes: false,
    },
  });

  const audiences = watch(["audienceAlumnos", "audiencePadres", "audienceDocentes"]);

  const onSubmit = handleSubmit(async (values) => {
    const audience: string[] = [];
    if (values.audienceAlumnos) audience.push("alumnos");
    if (values.audiencePadres) audience.push("padres");
    if (values.audienceDocentes) audience.push("docentes");

    try {
      await create.mutateAsync({
        title: values.title,
        body: values.body,
        courseId: values.courseId || undefined,
        audience,
        publishAt: values.publishAt ? new Date(values.publishAt).toISOString() : undefined,
        visibleUntil: values.visibleUntil
          ? new Date(values.visibleUntil).toISOString()
          : undefined,
      });
      toast.success("Anuncio creado");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nuevo anuncio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo anuncio</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("title", { required: true })} />
            {errors.title && <p className="text-xs text-destructive">Requerido</p>}
          </div>
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea rows={4} {...register("body", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Curso (opcional)</Label>
            <Input placeholder="course_5B_2025" {...register("courseId")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Publicar el</Label>
              <Input type="datetime-local" {...register("publishAt")} />
            </div>
            <div className="space-y-2">
              <Label>Visible hasta</Label>
              <Input type="datetime-local" {...register("visibleUntil")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Audiencia</Label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={audiences[0]}
                  onCheckedChange={(v) =>
                    setValue("audienceAlumnos", v === true)
                  }
                />
                Alumnos
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={audiences[1]}
                  onCheckedChange={(v) => setValue("audiencePadres", v === true)}
                />
                Padres
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={audiences[2]}
                  onCheckedChange={(v) =>
                    setValue("audienceDocentes", v === true)
                  }
                />
                Docentes
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
