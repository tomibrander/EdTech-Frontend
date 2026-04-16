"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Ban, FolderTree, Loader2, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  useCreateWorkspaceUser,
  useMoveUserOU,
  useSuspendUser,
} from "@/features/workspace/hooks";

export default function WorkspaceUsersPage() {
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
          title="Google Workspace · Usuarios"
          description="Administración de cuentas institucionales"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <CreateUserCard />
          <MoveOUCard />
          <SuspendUserCard />
        </div>
      </div>
    </RoleGate>
  );
}

function CreateUserCard() {
  const create = useCreateWorkspaceUser();
  const { register, handleSubmit, reset } = useForm<{
    firstName: string;
    lastName: string;
    primaryEmail: string;
    password: string;
    orgUnitPath: string;
  }>({ defaultValues: { orgUnitPath: "/Alumnos/2025" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success("Cuenta creada");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-primary" /> Crear cuenta
        </CardTitle>
        <CardDescription>Crea un usuario de Google Workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre"><Input {...register("firstName", { required: true })} /></Field>
            <Field label="Apellido"><Input {...register("lastName", { required: true })} /></Field>
          </div>
          <Field label="Email primario">
            <Input type="email" {...register("primaryEmail", { required: true })} />
          </Field>
          <Field label="Contraseña inicial">
            <Input type="text" {...register("password", { required: true })} />
          </Field>
          <Field label="OU">
            <Input {...register("orgUnitPath", { required: true })} />
          </Field>
          <Button type="submit" disabled={create.isPending} className="w-full">
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MoveOUCard() {
  const move = useMoveUserOU();
  const { register, handleSubmit, reset } = useForm<{
    userKey: string;
    newOrgUnitPath: string;
  }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await move.mutateAsync(values);
      toast.success("Usuario movido de OU");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderTree className="h-4 w-4 text-primary" /> Mover de OU
        </CardTitle>
        <CardDescription>Cambia la unidad organizacional</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Usuario (email o userKey)">
            <Input {...register("userKey", { required: true })} />
          </Field>
          <Field label="Nueva OU">
            <Input
              placeholder="/Alumnos/2026"
              {...register("newOrgUnitPath", { required: true })}
            />
          </Field>
          <Button type="submit" disabled={move.isPending} className="w-full">
            {move.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Mover
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SuspendUserCard() {
  const suspend = useSuspendUser();
  const { register, handleSubmit, reset } = useForm<{ userKey: string }>();

  const onSubmit = handleSubmit(async ({ userKey }) => {
    if (!confirm("Seguro que querés suspender esta cuenta?")) return;
    try {
      await suspend.mutateAsync(userKey);
      toast.success("Cuenta suspendida");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ban className="h-4 w-4 text-destructive" /> Suspender cuenta
        </CardTitle>
        <CardDescription>Bloquea el acceso sin eliminar datos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Usuario (email o userKey)">
            <Input {...register("userKey", { required: true })} />
          </Field>
          <Button
            type="submit"
            variant="destructive"
            disabled={suspend.isPending}
            className="w-full"
          >
            {suspend.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Suspender
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
