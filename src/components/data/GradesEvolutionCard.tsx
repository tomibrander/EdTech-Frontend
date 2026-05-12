"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data/EmptyState";
import { formatDate } from "@/lib/utils";
import type { StudentDashboard } from "@/types";

type Grade = StudentDashboard["recentGrades"][number];

interface Props {
  grades: Grade[];
  isLoading: boolean;
}

interface ChartPoint {
  label: string;
  value: number;
  subject: string;
  raw: string;
}

function buildChartData(grades: Grade[]): { points: ChartPoint[]; avg: number } {
  const points: ChartPoint[] = grades.slice(-6).map((g, i) => ({
    label: (g.subject ?? `#${i + 1}`).slice(0, 5),
    value: parseFloat(((g.grade / g.maxGrade) * 10).toFixed(1)),
    subject: g.subject ?? "Sin materia",
    raw: `${g.grade} / ${g.maxGrade}`,
  }));
  const avg =
    points.length > 0
      ? parseFloat(
          (points.reduce((s, p) => s + p.value, 0) / points.length).toFixed(1)
        )
      : 0;
  return { points, avg };
}

function GradesTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartPoint;
  return (
    <div className="rounded-md border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold">{d.subject}</p>
      <p className="mt-0.5 text-muted-foreground">
        {d.raw}{" "}
        <span className="font-semibold text-foreground">→ {d.value}/10</span>
      </p>
    </div>
  );
}

export function GradesEvolutionCard({ grades, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { points, avg } = buildChartData(grades);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolución de notas</CardTitle>
          {points.length > 0 && (
            <Badge variant="outline" className="font-mono text-xs tabular-nums">
              Prom. {avg}/10
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {points.length === 0 ? (
          <EmptyState title="Sin notas recientes" />
        ) : (
          <>
            {/* ── Gráfico ─────────────────────────────── */}
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={points}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 5, 10]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<GradesTooltip />} cursor={false} />
                {/* Línea punteada del promedio */}
                <ReferenceLine
                  y={avg}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: `${avg}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                    dy: -4,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    stroke: "hsl(var(--card))",
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* ── Lista compacta (últimas 3) ──────────── */}
            <div className="divide-y">
              {grades
                .slice(-3)
                .reverse()
                .map((g, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium">{g.subject}</p>
                      {g.assignmentTitle && (
                        <p className="text-xs text-muted-foreground">
                          {g.assignmentTitle}
                        </p>
                      )}
                      {g.gradedAt && (
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(g.gradedAt)}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-semibold tabular-nums">
                      {g.grade}
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        / {g.maxGrade}
                      </span>
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
