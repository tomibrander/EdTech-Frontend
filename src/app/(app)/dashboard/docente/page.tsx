"use client";
import Link from "next/link";
import { BookOpen, Clock, MessageSquare, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { useTeacherDashboard } from "@/features/dashboard/hooks";
import { useSession } from "@/features/auth/useSession";
import { fromNow } from "@/lib/utils";

export default function TeacherDashboardPage() {
  const { user } = useSession();
  const { data, isLoading } = useTeacherDashboard();

  const totalStudents = data?.courses.reduce((acc, c) => acc + c.studentCount, 0) ?? 0;
  const totalPending = data?.courses.reduce((acc, c) => acc + c.pendingGrades, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.displayName ?? "docente"}`}
        description="Tu agenda y cursos a cargo"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cursos" value={data?.courses.length ?? 0} icon={BookOpen} />
        <StatCard label="Alumnos" value={totalStudents} icon={Users} />
        <StatCard
          label="Notas pendientes"
          value={totalPending}
          hint="Por cargar en Classroom"
          icon={Clock}
        />
        <StatCard
          label="Mensajes sin leer"
          value={data?.unreadMessages ?? 0}
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis cursos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : data && data.courses.length > 0 ? (
              data.courses.map((c) => (
                <div key={c.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/cursos/${c.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.studentCount} alumnos · {c.pendingGrades} notas pendientes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/classroom/cursos/${c.id}/calificaciones`}>
                          Calificar
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/asistencia?courseId=${c.id}`}>Asistencia</Link>
                      </Button>
                    </div>
                  </div>
                  {c.upcomingWork.length > 0 && (
                    <div className="mt-3 space-y-1 border-t pt-3">
                      {c.upcomingWork.map((w, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">{w.title}</span>
                          <Badge variant="muted">{fromNow(w.dueDate)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState title="No tenés cursos asignados" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mi agenda de hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : data && data.calendarToday.length > 0 ? (
              data.calendarToday.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md border p-2 text-sm"
                >
                  <div className="w-14 font-mono font-semibold text-primary">
                    {e.time}
                  </div>
                  <div className="flex-1 truncate">{e.subject}</div>
                </div>
              ))
            ) : (
              <EmptyState title="Sin clases hoy" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
