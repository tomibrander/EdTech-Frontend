"use client";
import { useMemo } from "react";
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
import { fromNow } from "@/lib/utils";
import { GradesEvolutionCard } from "@/components/data/GradesEvolutionCard";
import { tenantConfig } from "@/config/tenant.config";
import type { CourseWork } from "@/types";

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === ref.getTime();
}

function buildGreetingSubtitle(work: CourseWork[], phrases: string[]): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const examToday = work.find(
    (w) => w.type === "exam" && !!w.dueDate && isSameDay(w.dueDate, today)
  );
  if (examToday)
    return `¡Hoy tenés examen de ${examToday.subject ?? examToday.title}!`;

  const examTomorrow = work.find(
    (w) => w.type === "exam" && !!w.dueDate && isSameDay(w.dueDate, tomorrow)
  );
  if (examTomorrow)
    return `Mañana tenés examen de ${examTomorrow.subject ?? examTomorrow.title}. ¡Preparate!`;

  const taskToday = work.find(
    (w) => w.type === "task" && !!w.dueDate && isSameDay(w.dueDate, today)
  );
  if (taskToday)
    return `Recordá: hoy vence "${taskToday.title}".`;

  return phrases[Math.floor(Math.random() * phrases.length)] ?? "¡Buen día!";
}

export default function StudentDashboardPage() {
  const { user } = useSession();
  const { data, isLoading } = useStudentDashboard();

  const greetingSubtitle = useMemo(() => {
    if (!data) return undefined;
    return buildGreetingSubtitle(
      data.upcomingWork,
      tenantConfig.textos.motivationalPhrases
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={data?.student.courseName}
        title={`Hola, ${user?.displayName?.split(" ")[0] ?? ""}`}
        description={greetingSubtitle}
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

        <GradesEvolutionCard
          grades={data?.recentGrades ?? []}
          isLoading={isLoading}
        />
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
