"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, ExternalLink, Mail, Phone } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStudent } from "@/features/students/hooks";
import { formatDate, getInitials } from "@/lib/utils";

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
