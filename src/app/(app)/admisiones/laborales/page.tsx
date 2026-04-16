"use client";
import * as React from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/data/StatusBadge";
import { EmptyState } from "@/components/data/EmptyState";
import {
  useJobApplications,
  useUpdateJobStatus,
} from "@/features/admissions/hooks";
import type { JobApplicationStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const STATUSES: (JobApplicationStatus | "all")[] = [
  "all",
  "recibida",
  "en_revision",
  "entrevistado",
  "contratado",
  "descartado",
];

export default function JobApplicationsPage() {
  const [status, setStatus] = React.useState<JobApplicationStatus | "all">("all");
  const [position, setPosition] = React.useState("");
  const { data, isLoading } = useJobApplications({ status, position: position || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postulaciones laborales"
        description="Candidatos recibidos por el formulario público"
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Input
            placeholder="Filtrar por posición"
            className="max-w-sm"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Select value={status} onValueChange={(v) => setStatus(v as JobApplicationStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "Todos" : s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Postulante</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Recibida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.data.length > 0 ? (
              data.data.map((j) => (
                <JobRow key={j.id} j={j} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="Sin postulaciones" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function JobRow({ j }: { j: import("@/types").JobApplication }) {
  const update = useUpdateJobStatus(j.id);

  return (
    <TableRow>
      <TableCell className="font-medium">{j.applicantName}</TableCell>
      <TableCell>{j.position}</TableCell>
      <TableCell className="flex items-center gap-1 text-muted-foreground">
        {j.email}
        {j.cvUrl && (
          <a
            href={j.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </TableCell>
      <TableCell>
        <Select
          value={j.status}
          onValueChange={async (v) => {
            try {
              await update.mutateAsync({ status: v as JobApplicationStatus });
              toast.success("Estado actualizado");
            } catch {
              toast.error("Error al actualizar");
            }
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue>
              <StatusBadge status={j.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.filter((s) => s !== "all").map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(j.createdAt)}</TableCell>
    </TableRow>
  );
}
