"use client";
import Link from "next/link";
import { ClipboardList, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { useClassroomCourses } from "@/features/classroom/hooks";

export default function ClassroomCoursesPage() {
  const { data, isLoading, isError, error } = useClassroomCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materias"
        description="Materias sincronizadas desde Google Classroom"
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={ClipboardList}
          title="No se pudieron cargar las materias"
          description={
            error instanceof Error ? error.message : "Reintentá en unos segundos"
          }
        />
      ) : data && data.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-semibold">{c.name}</p>
                  {c.state && (
                    <Badge
                      variant={c.state === "ACTIVE" ? "default" : "muted"}
                    >
                      {c.state}
                    </Badge>
                  )}
                </div>
                {c.section && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {c.section}
                  </p>
                )}
                {c.enrollmentCode && (
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Código de inscripción:{" "}
                    <span className="font-mono text-foreground">
                      {c.enrollmentCode}
                    </span>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${c.id}/tareas`}>
                      Tareas
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${c.id}/calificaciones`}>
                      Notas
                    </Link>
                  </Button>
                  {c.alternateLink && (
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={c.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir en Classroom
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No hay materias visibles"
          description="El usuario actual no figura como profesor o alumno en ninguna materia de Classroom."
        />
      )}
    </div>
  );
}
