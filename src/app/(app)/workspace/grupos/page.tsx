"use client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RoleGate } from "@/components/auth/RoleGate";
import { useCreateGroup } from "@/features/workspace/hooks";

export default function WorkspaceGroupsPage() {
  return (
    <RoleGate
      roles={["superadmin"]}
      fallback={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Solo el super-admin puede acceder a esta sección.
        </p>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Grupos de Google"
          description="Administración de grupos (distribución y permisos)"
        />
        <CreateGroupCard />
      </div>
    </RoleGate>
  );
}

function CreateGroupCard() {
  const create = useCreateGroup();
  const { register, handleSubmit, reset } = useForm<{
    email: string;
    name: string;
    description?: string;
  }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success("Grupo creado");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-primary" /> Crear grupo
        </CardTitle>
        <CardDescription>Crea un nuevo grupo en Google Workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre del grupo">
              <Input placeholder="5to B 2025" {...register("name", { required: true })} />
            </Field>
            <Field label="Email del grupo">
              <Input
                type="email"
                placeholder="5bo-2025@colegio.edu.ar"
                {...register("email", { required: true })}
              />
            </Field>
          </div>
          <Field label="Descripción">
            <Textarea rows={3} {...register("description")} />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear grupo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
