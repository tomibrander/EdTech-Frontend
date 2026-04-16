"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  alumno: "Alumno",
  docente: "Docente",
  director: "Director",
  padre: "Padre",
  alumnos: "Alumnos",
  cursos: "Cursos",
  asistencia: "Asistencia",
  mensajes: "Mensajes",
  anuncios: "Anuncios",
  classroom: "Classroom",
  admisiones: "Admisiones",
  prospectos: "Prospectos",
  laborales: "Postulaciones",
  workspace: "Workspace",
  usuarios: "Usuarios",
  grupos: "Grupos",
  perfil: "Perfil",
  asistente: "Asistente IA",
  tareas: "Tareas",
  calificaciones: "Calificaciones",
  nuevo: "Nuevo",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs = parts.map((p, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const label = LABELS[p] ?? p;
    return { href, label, isLast: i === parts.length - 1 };
  });

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {c.isLast ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
