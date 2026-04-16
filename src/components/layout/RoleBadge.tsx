import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/config/roles";

export function RoleBadge({ role }: { role: Role }) {
  const variantByRole: Record<Role, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    superadmin: "destructive",
    director: "default",
    docente: "success",
    alumno: "secondary",
    padre: "warning",
  };
  return <Badge variant={variantByRole[role]}>{ROLE_LABELS[role]}</Badge>;
}
