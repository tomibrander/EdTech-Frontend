import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CalendarCheck2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  Sparkles,
  Users,
  UserPlus,
  Briefcase,
} from "lucide-react";
import type { Role } from "./roles";
import { tenantConfig } from "./tenant.config";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  enabled?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export function getNavSections(): NavSection[] {
  const f = tenantConfig.features;

  const sections: NavSection[] = [
    {
      label: "General",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: ["superadmin", "director", "docente", "alumno", "padre"],
        },
      ],
    },
    {
      label: "Académico",
      items: [
        {
          label: "Alumnos",
          href: "/alumnos",
          icon: GraduationCap,
          roles: ["superadmin", "director", "docente"],
        },
        {
          label: "Cursos",
          href: "/cursos",
          icon: BookOpen,
          roles: ["superadmin", "director", "docente"],
        },
        {
          label: "Asistencia",
          href: "/asistencia",
          icon: CalendarCheck2,
          roles: ["superadmin", "director", "docente"],
        },
        {
          label: "Tareas y exámenes",
          href: "/classroom",
          icon: ClipboardList,
          roles: ["superadmin", "director", "docente", "alumno"],
        },
        {
          label: "Asistente IA",
          href: "/classroom/asistente",
          icon: Sparkles,
          roles: ["superadmin", "director", "docente", "alumno", "padre"],
          enabled: f.classroomAI,
        },
      ],
    },
    {
      label: "Comunicación",
      items: [
        {
          label: "Mensajes",
          href: "/mensajes",
          icon: MessageSquare,
          roles: ["superadmin", "director", "docente", "alumno", "padre"],
          enabled: f.mensajes,
        },
        {
          label: "Anuncios",
          href: "/anuncios",
          icon: Megaphone,
          roles: ["superadmin", "director", "docente", "alumno", "padre"],
          enabled: f.anuncios,
        },
      ],
    },
    {
      label: "Admisión",
      items: [
        {
          label: "Prospectos",
          href: "/admisiones/prospectos",
          icon: UserPlus,
          roles: ["superadmin", "director"],
          enabled: f.admisiones,
        },
        {
          label: "Postulaciones laborales",
          href: "/admisiones/laborales",
          icon: Briefcase,
          roles: ["superadmin", "director"],
          enabled: f.postulacionesLaborales,
        },
      ],
    },
    {
      label: "Administración",
      items: [
        {
          label: "Usuarios Workspace",
          href: "/workspace/usuarios",
          icon: Users,
          roles: ["superadmin"],
          enabled: f.workspaceAdmin,
        },
        {
          label: "Grupos de Google",
          href: "/workspace/grupos",
          icon: Building2,
          roles: ["superadmin"],
          enabled: f.workspaceAdmin,
        },
      ],
    },
  ];

  return sections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => i.enabled !== false),
    }))
    .filter((s) => s.items.length > 0);
}

export function filterNavByRole(sections: NavSection[], role: Role): NavSection[] {
  return sections
    .map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(role)) }))
    .filter((s) => s.items.length > 0);
}
