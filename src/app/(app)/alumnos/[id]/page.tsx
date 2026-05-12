"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, ExternalLink, GraduationCap, Mail, Phone } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleGate } from "@/components/auth/RoleGate";
import { useStudent } from "@/features/students/hooks";
import { formatDate, getInitials } from "@/lib/utils";
import type { CourseHistoryEntry } from "@/types";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useStudent(id);

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
            <CardTitle>Adultos responsables</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.parents && data.parents.length > 0 ? (
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
            ) : isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">Sin contactos registrados.</p>
            )}
          </CardContent>
        </Card>
      </div>

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
                {/* Curso actual — siempre primero */}
                <AcademicEntry
                  courseCode={data.courseName ?? data.courseId}
                  year={new Date().getFullYear()}
                  isCurrent
                />
                {/* Historial — más reciente primero */}
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
    </div>
  );
}

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
      {/* Dot sobre el borde izquierdo */}
      <span
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
          isCurrent ? "bg-primary" : "bg-muted-foreground"
        }`}
      />

      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        {/* Año */}
        <span className="min-w-[3rem] text-sm font-semibold tabular-nums text-muted-foreground">
          {props.year}
        </span>

        {/* Curso + icono */}
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
          {props.courseCode}
        </span>

        {/* Estado */}
        {isCurrent ? (
          <Badge className="h-5 px-2 text-[11px]">Cursando</Badge>
        ) : promoted ? (
          <Badge variant="outline" className="h-5 border-success/50 bg-success/10 px-2 text-[11px] text-success">
            Promovido
          </Badge>
        ) : (
          <Badge variant="destructive" className="h-5 px-2 text-[11px]">
            Repitió
          </Badge>
        )}
      </div>

      {notes && (
        <p className="mt-1 text-xs text-muted-foreground">{notes}</p>
      )}
      {movedAt && (
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
          Cambio registrado el {formatDate(movedAt)}
        </p>
      )}
    </li>
  );
}
