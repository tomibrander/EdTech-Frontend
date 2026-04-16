"use client";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { useCourses } from "@/features/courses/hooks";

export default function ClassroomCoursesPage() {
  const { data, isLoading } = useCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classroom"
        description="Elegí un curso para ver tareas, exámenes y calificaciones"
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase text-primary">
                  {c.year}
                </p>
                <p className="mt-1 text-base font-semibold">{c.name}</p>
                {c.teacherName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.teacherName}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${c.id}/tareas`}>Tareas</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/classroom/cursos/${c.id}/calificaciones`}>
                      Notas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="No hay cursos" />
      )}
    </div>
  );
}
