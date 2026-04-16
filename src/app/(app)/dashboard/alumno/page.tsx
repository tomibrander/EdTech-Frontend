"use client";
import { CalendarCheck2, ClipboardList, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/data/EmptyState";
import { useStudentDashboard } from "@/features/dashboard/hooks";
import { useSession } from "@/features/auth/useSession";
import { formatDate, fromNow } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { user } = useSession();
  const { data, isLoading } = useStudentDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola ${user?.displayName?.split(" ")[0] ?? ""}`}
        description={
          data?.student.courseName
            ? `Curso actual · ${data.student.courseName}`
            : "Tu panel personal"
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/classroom/asistente">
              <Sparkles className="h-4 w-4" /> Preguntarle a la IA
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Asistencia"
          value={data ? `${data.attendance.percentage.toFixed(1)}%` : "—"}
          hint={data ? `${data.attendance.absentDays} faltas acumuladas` : undefined}
          icon={CalendarCheck2}
        />
        <StatCard
          label="Próximos trabajos"
          value={data?.upcomingWork.length ?? 0}
          hint="Tareas y exámenes pendientes"
          icon={ClipboardList}
        />
        <StatCard
          label="Última nota"
          value={
            data?.recentGrades?.[0]
              ? `${data.recentGrades[0].grade} / ${data.recentGrades[0].maxGrade}`
              : "—"
          }
          hint={data?.recentGrades?.[0]?.subject}
          icon={TrendingUp}
        />
        <StatCard
          label="Curso"
          value={data?.student.courseName ?? "—"}
          icon={GraduationCap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximos trabajos</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link href="/classroom">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : data && data.upcomingWork.length > 0 ? (
              data.upcomingWork.map((w) => (
                <div
                  key={w.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{w.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {w.subject ?? "Materia"} · vence {fromNow(w.dueDate)}
                    </p>
                  </div>
                  <Badge variant={w.type === "exam" ? "destructive" : "default"}>
                    {w.type === "exam" ? "Examen" : "Tarea"}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="Nada pendiente"
                description="No tenés tareas ni exámenes próximos."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas calificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : data && data.recentGrades.length > 0 ? (
              data.recentGrades.map((g, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{g.subject}</p>
                    {g.assignmentTitle && (
                      <p className="text-xs text-muted-foreground">{g.assignmentTitle}</p>
                    )}
                    {g.gradedAt && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(g.gradedAt)}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-semibold">
                    {g.grade}
                    <span className="text-sm text-muted-foreground"> / {g.maxGrade}</span>
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="Sin notas recientes" />
            )}
          </CardContent>
        </Card>
      </div>

      {data?.reminders && data.reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.reminders.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
