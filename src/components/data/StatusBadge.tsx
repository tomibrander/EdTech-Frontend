import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus, JobApplicationStatus, ProspectStatus } from "@/types";

type AnyStatus = ProspectStatus | JobApplicationStatus | AttendanceStatus | string;

const COLOR: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "secondary"> = {
  pendiente: "warning",
  entrevistado: "default",
  aceptado: "success",
  rechazado: "destructive",
  alta: "success",
  recibida: "warning",
  en_revision: "default",
  contratado: "success",
  descartado: "destructive",
  presente: "success",
  ausente: "destructive",
  tarde: "warning",
  programado: "warning",
  publicado: "success",
  expirado: "muted",
  PUBLISHED: "success",
  DRAFT: "muted",
  TURNED_IN: "success",
  CREATED: "muted",
};

const LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  entrevistado: "Entrevistado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  alta: "Alta",
  recibida: "Recibida",
  en_revision: "En revisión",
  contratado: "Contratado",
  descartado: "Descartado",
  presente: "Presente",
  ausente: "Ausente",
  tarde: "Tarde",
  programado: "Programado",
  publicado: "Publicado",
  expirado: "Expirado",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const variant = COLOR[status] ?? "muted";
  const label = LABEL[status] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}
