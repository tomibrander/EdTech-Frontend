"use client";
import { BarChart3, Building2, GraduationCap, UserPlus, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { useDirectorDashboard } from "@/features/dashboard/hooks";
import { fromNow } from "@/lib/utils";

export default function DirectorDashboardPage() {
  const { data, isLoading } = useDirectorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de dirección"
        description="Indicadores globales del colegio"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alumnos"
          value={data?.school.totalStudents ?? "—"}
          icon={GraduationCap}
        />
        <StatCard
          label="Docentes"
          value={data?.school.totalTeachers ?? "—"}
          icon={Users}
        />
        <StatCard
          label="Cursos"
          value={data?.school.totalCourses ?? "—"}
          icon={Building2}
        />
        <StatCard
          label="Admisiones pendientes"
          value={data?.pendingAdmissions ?? "—"}
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : data ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Hoy
                    </p>
                    <p className="mt-1 text-3xl font-semibold">
                      {data.attendance.todayPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Promedio semanal
                    </p>
                    <p className="mt-1 text-3xl font-semibold">
                      {data.attendance.weekAverage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Promedio por materia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : data ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Promedio del colegio ·{" "}
                  <span className="font-semibold text-foreground">
                    {data.grades.schoolAverage.toFixed(2)}
                  </span>
                </p>
                <div className="space-y-2 pt-2">
                  {data.grades.bySubject.map((s) => (
                    <div key={s.subject} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{s.subject}</span>
                        <span className="font-medium">{s.average.toFixed(1)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(s.average / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data && data.recentActivity.length > 0 ? (
            <ul className="divide-y">
              {data.recentActivity.map((a, i) => (
                <li key={i} className="flex items-center justify-between py-3 text-sm">
                  <span>{a.description}</span>
                  <span className="text-xs text-muted-foreground">
                    {fromNow(a.at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Sin actividad reciente" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
