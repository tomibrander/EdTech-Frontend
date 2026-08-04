"use client";
import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck2,
  ExternalLink,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleGate } from "@/components/auth/RoleGate";
import { useSession } from "@/features/auth/useSession";
import { useStudent, useUpdateParents } from "@/features/students/hooks";
import { useAttendanceSummary } from "@/features/attendance/hooks";
import { formatDate, getInitials, cn } from "@/lib/utils";
import type { CourseHistoryEntry } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParentForm {
  name: string;
  email: string;
  phone: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useStudent(id);
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceSummary(id, new Date().getFullYear());
  const { role } = useSession();
  const canEdit = role === "director" || role === "superadmin";

  const [parentsOpen, setParentsOpen] = useState(false);

  const openParentsDialog = () => {
    setParentsOpen(true);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/alumnos">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      {isLoading || !data ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <PageHeader
          title={data.displayName}
          description={`${data.courseName} · ${data.institutionalEmail}`}
          actions={
            <Button asChild variant="outline">
              <Link href={`/alumnos/${id}/asistencia`}>
                <CalendarCheck2 className="h-4 w-4" /> Ver asistencia
              </Link>
            </Button>
          }
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{getInitials(data.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{data.displayName}</p>
                  <p className="text-sm text-muted-foreground">{data.courseName}</p>
                </div>
              </div>
            )}
            <div className="space-y-2 border-t pt-4 text-sm">
              <Row label="Email" value={data?.institutionalEmail} />
              <Row label="Fecha de nacimiento" value={formatDate(data?.birthDate)} />
              <Row label="Ingresó" value={formatDate(data?.enrolledAt)} />
              <Row label="Google ID" value={data?.googleAccountId ?? "—"} mono />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Adultos responsables</CardTitle>
              {canEdit && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={openParentsDialog}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : data?.parents && data.parents.length > 0 ? (
              <ul className="divide-y">
                {data.parents.map((p, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <a
                      href={`mailto:${p.email}`}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" /> {p.email}
                    </a>
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Phone className="h-3.5 w-3.5" /> {p.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sin adultos responsables registrados.
                </p>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={openParentsDialog}>
                    <Plus className="h-4 w-4" /> Agregar ahora
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asistencia {new Date().getFullYear()}</CardTitle>
            {attendance && (
              <span
                className={cn(
                  "text-sm font-semibold",
                  attendance.percentage >= 75
                    ? "text-emerald-600"
                    : "text-destructive"
                )}
              >
                {attendance.percentage.toFixed(1)}%
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendanceLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : attendance ? (
            <>
              {attendance.percentage < 75 && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <span className="font-medium">Riesgo de inasistencia</span>
                  <span className="text-destructive/70">
                    · Por debajo del 75% requerido
                  </span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-semibold">{attendance.presentDays}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Presentes</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-semibold">{attendance.absentDays}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Ausentes</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-semibold">{attendance.lateDays}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tardanzas</p>
                </div>
              </div>
              {(attendance.byMonth?.length ?? 0) > 0 && (
                <div className="flex items-end gap-1.5 pt-1" style={{ height: 72 }}>
                  {attendance.byMonth.map((m) => {
                    const total = m.present + m.absent + m.late;
                    const pct = total > 0 ? (m.present / total) * 100 : 0;
                    return (
                      <div
                        key={m.month}
                        className="group relative flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="relative w-full rounded-t bg-muted"
                          style={{ height: 48 }}
                        >
                          <div
                            className={cn(
                              "absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500",
                              pct >= 75 ? "bg-primary" : "bg-destructive"
                            )}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {m.month.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin registros de asistencia.</p>
          )}
        </CardContent>
      </Card>

      <RoleGate roles={["director", "superadmin"]} fallback={null}>
        <Card>
          <CardHeader>
            <CardTitle>Ciclo académico</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <ol className="relative ml-3 space-y-0 border-l border-border">
                <AcademicEntry
                  courseCode={data.courseName ?? data.courseId}
                  year={new Date().getFullYear()}
                  isCurrent
                />
                {[...(data.courseHistory ?? [])].reverse().map((e, i) => (
                  <AcademicEntry key={i} {...e} isCurrent={false} />
                ))}
                {(data.courseHistory?.length ?? 0) === 0 && (
                  <li className="pb-2 pl-6 text-sm text-muted-foreground">
                    Sin historial de cursos previos.
                  </li>
                )}
              </ol>
            )}
          </CardContent>
        </Card>
      </RoleGate>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/alumnos/${id}/asistencia`}>
              <CalendarCheck2 className="h-4 w-4" /> Resumen de asistencia
            </Link>
          </Button>
          {data?.googleAccountId && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://admin.google.com/ac/users/${data.googleAccountId}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4" /> Abrir en Google Admin
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición de adultos responsables */}
      <Dialog open={parentsOpen} onOpenChange={setParentsOpen}>
        <DialogContent className="max-w-lg">
          <ParentsEditDialog
            studentId={id}
            initialParents={(data?.parents ?? []).map((p) => ({
              name: p.name,
              email: p.email,
              phone: p.phone ?? "",
            }))}
            onClose={() => setParentsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ParentsEditDialog ────────────────────────────────────────────────────────

function ParentsEditDialog({
  studentId,
  initialParents,
  onClose,
}: {
  studentId: string;
  initialParents: ParentForm[];
  onClose: () => void;
}) {
  const [parents, setParents] = useState<ParentForm[]>(
    initialParents.length > 0 ? initialParents : []
  );
  const { mutate, isPending } = useUpdateParents(studentId);

  const update = (i: number, field: keyof ParentForm, value: string) =>
    setParents((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    );

  const add = () =>
    setParents((prev) => [...prev, { name: "", email: "", phone: "" }]);

  const remove = (i: number) =>
    setParents((prev) => prev.filter((_, idx) => idx !== i));

  const save = () => {
    const valid = parents
      .filter((p) => p.name.trim() && p.email.trim())
      .map((p) => ({ name: p.name.trim(), email: p.email.trim(), phone: p.phone.trim() || undefined }));
    mutate(valid, { onSuccess: onClose });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Adultos responsables</DialogTitle>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto py-1 pr-1">
        {parents.length === 0 && (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No hay adultos cargados. Agregá uno abajo.
          </p>
        )}

        {parents.map((p, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contacto {i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                aria-label="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input
              placeholder="Nombre completo"
              value={p.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={p.email}
              onChange={(e) => update(i, "email", e.target.value)}
            />
            <Input
              placeholder="Teléfono (opcional)"
              value={p.phone}
              onChange={(e) => update(i, "phone", e.target.value)}
            />
          </div>
        ))}

        {parents.length < 3 && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={add}
          >
            <Plus className="h-4 w-4" />
            Agregar adulto responsable
          </Button>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <p className="text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-xs" : ""}>{value ?? "—"}</p>
    </div>
  );
}

function AcademicEntry(
  props:
    | (CourseHistoryEntry & { isCurrent: false })
    | { courseCode: string; year: number; isCurrent: true }
) {
  const isCurrent = props.isCurrent;
  const promoted = isCurrent ? undefined : (props as CourseHistoryEntry).promoted;
  const notes = isCurrent ? undefined : (props as CourseHistoryEntry).notes;
  const movedAt = isCurrent ? undefined : (props as CourseHistoryEntry).movedAt;

  return (
    <li className="relative pb-6 pl-6 last:pb-0">
      <span
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
          isCurrent ? "bg-primary" : "bg-muted-foreground"
        }`}
      />

      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <span className="min-w-[3rem] text-sm font-semibold tabular-nums text-muted-foreground">
          {props.year}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
          {props.courseCode}
        </span>
        {isCurrent ? (
          <Badge className="h-5 px-2 text-[11px]">Cursando</Badge>
        ) : promoted ? (
          <Badge
            variant="outline"
            className="h-5 border-success/50 bg-success/10 px-2 text-[11px] text-success"
          >
            Promovido
          </Badge>
        ) : (
          <Badge variant="destructive" className="h-5 px-2 text-[11px]">
            Repitió
          </Badge>
        )}
      </div>

      {notes && <p className="mt-1 text-xs text-muted-foreground">{notes}</p>}
      {movedAt && (
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
          Cambio registrado el {formatDate(movedAt)}
        </p>
      )}
    </li>
  );
}
