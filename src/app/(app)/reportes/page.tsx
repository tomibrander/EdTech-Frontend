"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck2,
  Clock,
  FileText,
  Link,
  Monitor,
  Play,
  Save,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/components/auth/RoleGate";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportType =
  | "calificaciones"
  | "asistencia"
  | "riesgo"
  | "boletin"
  | "funnel"
  | "resumen";

type ReportFormat = "pantalla" | "pdf" | "csv" | "link";

type ReportCategory =
  | "todos"
  | "academico"
  | "asistencia"
  | "admisiones"
  | "institucion";

interface ReportFilters {
  period: string;
  curso: string;
  nivel: string;
  docente: string;
  materia: string;
}

interface ReportTypeOption {
  id: ReportType;
  label: string;
  category: Exclude<ReportCategory, "todos">;
  icon: React.ElementType;
}

// ─── Placeholder data ────────────────────────────────────────────────────────

const DATA = {
  totalAlumnos: 320,
  totalCursos: 12,
  promedioGeneral: 7.6,
  asistenciaHoy: 93.4,
  admisionesPendientes: 8,
  bySubject: [
    { subject: "Lengua", average: 8.1 },
    { subject: "Cs. Naturales", average: 7.9 },
    { subject: "Historia", average: 7.6 },
    { subject: "Matemática", average: 7.2 },
    { subject: "Inglés", average: 7.0 },
  ],
  attendanceByDay: [
    { day: "Lunes", pct: 95.2 },
    { day: "Martes", pct: 93.8 },
    { day: "Miércoles", pct: 91.4 },
    { day: "Jueves", pct: 94.1 },
    { day: "Viernes", pct: 89.7 },
  ],
  riskStudents: [
    { name: "Valentina García", curso: "2do B", asistencia: 61 },
    { name: "Marcos Pérez", curso: "3ro A", asistencia: 64 },
    { name: "Sofía Romero", curso: "1ro A", asistencia: 67 },
    { name: "Lucas Martínez", curso: "2do A", asistencia: 68 },
    { name: "Camila Torres", curso: "4to B", asistencia: 70 },
  ],
  funnelStages: [
    { stage: "Consultas recibidas", count: 48 },
    { stage: "Formulario completado", count: 36 },
    { stage: "Entrevista realizada", count: 22 },
    { stage: "Documentación recibida", count: 15 },
    { stage: "Aceptados", count: 12 },
  ],
  institutionalSummary: [
    { key: "Alumnos totales", value: "320" },
    { key: "Docentes activos", value: "24" },
    { key: "Cursos activos", value: "12" },
    { key: "Promedio institucional", value: "7.6" },
    { key: "Asistencia promedio", value: "93.4%" },
    { key: "Admisiones pendientes", value: "8" },
    { key: "Año lectivo", value: "2026" },
  ],
} as const;

// ─── Config ──────────────────────────────────────────────────────────────────

const REPORT_TYPES: ReportTypeOption[] = [
  { id: "calificaciones", label: "Calificaciones", category: "academico", icon: BookOpen },
  { id: "asistencia", label: "Asistencia", category: "asistencia", icon: CalendarCheck2 },
  { id: "riesgo", label: "Alumnos en riesgo", category: "asistencia", icon: AlertTriangle },
  { id: "boletin", label: "Boletín individual PDF", category: "academico", icon: FileText },
  { id: "funnel", label: "Funnel de admisiones", category: "admisiones", icon: TrendingUp },
  { id: "resumen", label: "Resumen institucional", category: "institucion", icon: Building2 },
];

const CATEGORIES: { id: ReportCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "academico", label: "Académico" },
  { id: "asistencia", label: "Asistencia" },
  { id: "admisiones", label: "Admisiones" },
  { id: "institucion", label: "Institución" },
];

const COLUMNS_OPTIONS = [
  "Promedio final",
  "Asistencia %",
  "Inasistencias",
  "Tareas entregadas",
  "Notas por materia",
  "Observaciones",
  "Contacto del padre",
] as const;

const FORMAT_OPTIONS: { id: ReportFormat; label: string; icon: React.ElementType }[] = [
  { id: "pantalla", label: "Pantalla", icon: Monitor },
  { id: "pdf", label: "PDF", icon: Briefcase },
  { id: "csv", label: "CSV", icon: FileText },
  { id: "link", label: "Link", icon: Link },
];

const PERIOD_LABELS: Record<string, string> = {
  anio: "Este año lectivo",
  trimestre1: "1er trimestre",
  trimestre2: "2do trimestre",
  ultimos30: "Últimos 30 días",
  rango: "Rango personalizado",
};

// ─── Visualization sub-components ────────────────────────────────────────────

function GradesChart() {
  return (
    <div className="space-y-3">
      {DATA.bySubject.map((s) => (
        <div key={s.subject} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>{s.subject}</span>
            <span className="font-medium num-mono">{s.average.toFixed(1)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(s.average / 10) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceChart() {
  return (
    <div className="flex items-end gap-2 h-36">
      {DATA.attendanceByDay.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium num-mono text-muted-foreground">
            {d.pct.toFixed(0)}%
          </span>
          <div className="relative w-full rounded-t-md bg-muted" style={{ height: "88px" }}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-md bg-primary transition-all duration-500"
              style={{ height: `${d.pct}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">{d.day.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

function RiskTable() {
  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-3 gap-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>Alumno</span>
        <span>Curso</span>
        <span className="text-right">Asistencia</span>
      </div>
      {DATA.riskStudents.map((s) => (
        <div
          key={s.name}
          className="grid grid-cols-3 gap-2 rounded-md px-1 py-2 text-sm hover:bg-muted/50"
        >
          <span className="font-medium truncate">{s.name}</span>
          <span className="text-muted-foreground">{s.curso}</span>
          <span
            className={cn(
              "text-right font-semibold num-mono",
              s.asistencia < 65 ? "text-destructive" : "text-warning-foreground"
            )}
          >
            {s.asistencia}%
          </span>
        </div>
      ))}
    </div>
  );
}

function BoletinPreview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="font-serif text-2xl font-medium">7.6</p>
          <p className="mt-1 text-xs text-muted-foreground">Promedio general</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="font-serif text-2xl font-medium">93%</p>
          <p className="mt-1 text-xs text-muted-foreground">Asistencia</p>
        </div>
      </div>
      <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
        <FileText className="mx-auto mb-2 h-5 w-5 text-success" />
        <p className="text-sm font-medium text-success">Listo para exportar como PDF</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Seleccioná un alumno para generar su boletín individual
        </p>
      </div>
    </div>
  );
}

function FunnelChart() {
  const max = DATA.funnelStages[0].count;
  return (
    <div className="space-y-3">
      {DATA.funnelStages.map((stage, i) => (
        <div key={stage.stage} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{stage.stage}</span>
            <span className="font-medium num-mono">{stage.count}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${(stage.count / max) * 100}%`,
                opacity: 1 - i * 0.12,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InstitutionalSummary() {
  return (
    <dl className="divide-y">
      {DATA.institutionalSummary.map((item) => (
        <div key={item.key} className="flex justify-between py-2.5 text-sm">
          <dt className="text-muted-foreground">{item.key}</dt>
          <dd className="font-medium num-mono">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function ReportPreview({
  reportType,
  filters,
}: {
  reportType: ReportType;
  filters: ReportFilters;
}) {
  const meta = REPORT_TYPES.find((r) => r.id === reportType)!;
  const Icon = meta.icon;

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge className="gap-1.5">
          <Icon className="h-3 w-3" />
          {meta.label}
        </Badge>
        <Badge variant="outline">{PERIOD_LABELS[filters.period] ?? filters.period}</Badge>
        {filters.curso !== "todos" && (
          <Badge variant="muted">{filters.curso}</Badge>
        )}
        {filters.nivel !== "todos" && (
          <Badge variant="muted">{filters.nivel === "primaria" ? "Primaria" : "Secundaria"}</Badge>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-muted/30 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground num-mono">{DATA.totalAlumnos}</span>{" "}
          alumnos
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground num-mono">{DATA.totalCursos}</span>{" "}
          cursos
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">Actualizado hace 2 horas</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Promedio general"
          value={DATA.promedioGeneral}
          decimals={1}
        />
        <StatCard
          label="Asistencia hoy"
          value={DATA.asistenciaHoy}
          decimals={1}
          suffix="%"
        />
        <StatCard
          label="Admisiones pend."
          value={DATA.admisionesPendientes}
        />
      </div>

      {/* Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {meta.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === "calificaciones" && <GradesChart />}
          {reportType === "asistencia" && <AttendanceChart />}
          {reportType === "riesgo" && <RiskTable />}
          {reportType === "boletin" && <BoletinPreview />}
          {reportType === "funnel" && <FunnelChart />}
          {reportType === "resumen" && <InstitutionalSummary />}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("todos");
  const [selectedReport, setSelectedReport] = useState<ReportType>("calificaciones");
  const [filters, setFilters] = useState<ReportFilters>({
    period: "anio",
    curso: "todos",
    nivel: "todos",
    docente: "todos",
    materia: "todas",
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "Promedio final",
    "Asistencia %",
    "Notas por materia",
  ]);
  const [outputFormat, setOutputFormat] = useState<ReportFormat>("pantalla");

  const filteredReports = REPORT_TYPES.filter(
    (r) => selectedCategory === "todos" || r.category === selectedCategory
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <RoleGate roles={["director", "superadmin"]}>
      <div className="space-y-6">
        <PageHeader
          title="Reportes"
          eyebrow="Análisis"
          description="Construí reportes personalizados a partir de los datos del colegio"
          actions={
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Programar envío
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ── Left panel ────────────────────────────────── */}
          <div className="space-y-4">

            {/* Report type selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tipo de reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Report type grid */}
                <div className="grid grid-cols-2 gap-2">
                  {filteredReports.map((r) => {
                    const Icon = r.icon;
                    const active = selectedReport === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReport(r.id)}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-150",
                          active
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium leading-snug",
                            active ? "text-primary" : "text-foreground"
                          )}
                        >
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    {
                      key: "period" as const,
                      label: "Período",
                      options: [
                        { value: "anio", label: "Este año lectivo" },
                        { value: "trimestre1", label: "1er trimestre" },
                        { value: "trimestre2", label: "2do trimestre" },
                        { value: "ultimos30", label: "Últimos 30 días" },
                        { value: "rango", label: "Rango personalizado" },
                      ],
                    },
                    {
                      key: "curso" as const,
                      label: "Curso",
                      options: [
                        { value: "todos", label: "Todos" },
                        { value: "1ro A", label: "1ro A" },
                        { value: "1ro B", label: "1ro B" },
                        { value: "2do A", label: "2do A" },
                        { value: "2do B", label: "2do B" },
                        { value: "3ro A", label: "3ro A" },
                        { value: "4to B", label: "4to B" },
                      ],
                    },
                    {
                      key: "nivel" as const,
                      label: "Nivel",
                      options: [
                        { value: "todos", label: "Todos" },
                        { value: "primaria", label: "Primaria" },
                        { value: "secundaria", label: "Secundaria" },
                      ],
                    },
                    {
                      key: "docente" as const,
                      label: "Docente",
                      options: [
                        { value: "todos", label: "Todos" },
                        { value: "maria-lopez", label: "María López" },
                        { value: "carlos-gomez", label: "Carlos Gómez" },
                        { value: "ana-fernandez", label: "Ana Fernández" },
                        { value: "roberto-silva", label: "Roberto Silva" },
                      ],
                    },
                    {
                      key: "materia" as const,
                      label: "Materia",
                      options: [
                        { value: "todas", label: "Todas" },
                        { value: "lengua", label: "Lengua" },
                        { value: "matematica", label: "Matemática" },
                        { value: "historia", label: "Historia" },
                        { value: "cs-naturales", label: "Cs. Naturales" },
                        { value: "ingles", label: "Inglés" },
                      ],
                    },
                  ] satisfies { key: keyof ReportFilters; label: string; options: { value: string; label: string }[] }[]
                ).map(({ key, label, options }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <select
                      value={filters[key]}
                      onChange={(e) => updateFilter(key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Columns to include */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Columnas a incluir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS_OPTIONS.map((col) => {
                    const active = selectedColumns.includes(col);
                    return (
                      <button
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Output format */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Formato de salida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {FORMAT_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setOutputFormat(id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all",
                        outputFormat === id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Guardar plantilla
              </Button>
              <Button className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                Generar reporte
              </Button>
            </div>
          </div>

          {/* ── Right panel — Live preview ─────────────── */}
          <div>
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Vista previa
                  </CardTitle>
                  <Badge variant="muted" className="gap-1 text-[11px]">
                    <BarChart3 className="h-3 w-3" />
                    En vivo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ReportPreview reportType={selectedReport} filters={filters} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
