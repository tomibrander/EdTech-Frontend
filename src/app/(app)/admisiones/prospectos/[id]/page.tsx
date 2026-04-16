"use client";
import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/data/StatusBadge";
import {
  useEnrollProspect,
  useProspect,
  useUpdateProspectStatus,
} from "@/features/admissions/hooks";
import {
  prospectEnrollSchema,
  type ProspectEnrollValues,
} from "@/features/admissions/schemas";
import type { ProspectStatus } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

const STATUSES: ProspectStatus[] = [
  "pendiente",
  "entrevistado",
  "aceptado",
  "rechazado",
  "alta",
];

export default function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useProspect(id);
  const update = useUpdateProspectStatus(id);
  const [comment, setComment] = React.useState("");
  const [newStatus, setNewStatus] = React.useState<ProspectStatus | "">("");

  async function onUpdateStatus() {
    if (!newStatus) return;
    try {
      await update.mutateAsync({ status: newStatus, comment: comment || undefined });
      toast.success("Estado actualizado");
      setComment("");
      setNewStatus("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admisiones/prospectos">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-10 w-64" />
      ) : data ? (
        <PageHeader
          title={data.studentName}
          description={`Postula a ${data.gradeApplying}`}
          actions={
            <>
              <StatusBadge status={data.status} />
              {data.status === "aceptado" && <EnrollButton prospectId={id} />}
            </>
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos del postulante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : data ? (
              <>
                <Row label="Alumno" value={data.studentName} />
                <Row label="Fecha de nacimiento" value={formatDate(data.birthDate)} />
                <Row label="Grado al que aplica" value={data.gradeApplying} />
                <Row label="Responsable" value={data.parentName} />
                <Row label="Email responsable" value={data.parentEmail} />
                <Row label="Teléfono" value={data.parentPhone} />
                <Row label="Notas" value={data.notes ?? "—"} />
                <Row label="Recibido el" value={formatDateTime(data.createdAt)} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actualizar estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Nuevo estado</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as ProspectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comentario (opcional)</Label>
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <Button
                onClick={onUpdateStatus}
                disabled={!newStatus || update.isPending}
                className="w-full"
              >
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.history && data.history.length > 0 ? (
                <ol className="relative space-y-3 border-l pl-4 text-sm">
                  {data.history.map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <StatusBadge status={h.status} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(h.changedAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">Sin historial.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-2 last:border-0 sm:grid-cols-[200px_1fr]">
      <p className="text-muted-foreground">{label}</p>
      <p>{value ?? "—"}</p>
    </div>
  );
}

function EnrollButton({ prospectId }: { prospectId: string }) {
  const enroll = useEnrollProspect(prospectId);
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProspectEnrollValues>({
    resolver: zodResolver(prospectEnrollSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await enroll.mutateAsync(values);
      toast.success("Alumno dado de alta");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos dar de alta");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCheck className="h-4 w-4" /> Dar de alta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dar de alta al alumno</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Curso interno (courseId)</Label>
            <Input placeholder="course_5B_2025" {...register("courseId")} />
            {errors.courseId && (
              <p className="text-xs text-destructive">{errors.courseId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Classroom courseId</Label>
            <Input placeholder="123456789" {...register("classroomCourseId")} />
            {errors.classroomCourseId && (
              <p className="text-xs text-destructive">
                {errors.classroomCourseId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email institucional</Label>
            <Input
              type="email"
              placeholder="nombre.apellido@colegio.edu.ar"
              {...register("institutionalEmail")}
            />
            {errors.institutionalEmail && (
              <p className="text-xs text-destructive">
                {errors.institutionalEmail.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enroll.isPending}>
              {enroll.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar alta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
