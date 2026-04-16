export type Role = "superadmin" | "director" | "docente" | "alumno" | "padre";

export const ALL_ROLES: Role[] = [
  "superadmin",
  "director",
  "docente",
  "alumno",
  "padre",
];

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super admin",
  director: "Director",
  docente: "Docente",
  alumno: "Alumno",
  padre: "Padre/Madre",
};

export function hasRole(userRole: Role | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export const DASHBOARD_PATH: Record<Role, string> = {
  superadmin: "/dashboard/director",
  director: "/dashboard/director",
  docente: "/dashboard/docente",
  alumno: "/dashboard/alumno",
  padre: "/dashboard/padre",
};
