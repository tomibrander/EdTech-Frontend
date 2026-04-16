"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/data/StatCard";
import { useAttendanceSummary } from "@/features/attendance/hooks";

export default function StudentAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useAttendanceSummary(id, new Date().getFullYear());

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/alumnos/${id}`}>
          <ArrowLeft className="h-4 w-4" /> Volver al perfil
        </Link>
      </Button>

      <PageHeader
        title="Asistencia del alumno"
        description={data ? `${data.studentName} · año ${data.year}` : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Asistencia"
          value={data ? `${data.percentage.toFixed(1)}%` : "—"}
          hint={data ? `${data.totalDays} días totales` : undefined}
        />
        <StatCard label="Presentes" value={data?.presentDays ?? "—"} />
        <StatCard label="Ausentes" value={data?.absentDays ?? "—"} />
        <StatCard label="Tardanzas" value={data?.lateDays ?? "—"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por mes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : data && data.byMonth.length > 0 ? (
            <ul className="space-y-2">
              {data.byMonth.map((m) => {
                const total = m.present + m.absent + m.late;
                const pct = total > 0 ? (m.present / total) * 100 : 0;
                return (
                  <li key={m.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.month}</span>
                      <span className="text-muted-foreground">
                        {m.present}P · {m.absent}A · {m.late}T
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin registros.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
