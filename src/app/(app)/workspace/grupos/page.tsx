"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, Loader2, UserMinus, UserPlus, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data/EmptyState";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  useAddGroupMember,
  useCreateGroup,
  useGroups,
  useRemoveGroupMember,
} from "@/features/workspace/hooks";

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
        <GroupsListCard />
      </div>
    </RoleGate>
  );
}

function GroupsListCard() {
  const { data: groups, isLoading } = useGroups();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grupos del dominio ({groups?.length ?? 0})</CardTitle>
        <CardDescription>Grupos existentes en tu Google Workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : groups && groups.length > 0 ? (
          <ul className="divide-y">
            {groups.map((g) => (
              <li key={g.googleGroupId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{g.name || g.email}</p>
                  <p className="text-xs text-muted-foreground">{g.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <Users className="h-3 w-3" />
                    {g.memberCount}
                  </Badge>
                  <ManageMemberPopover groupEmail={g.email} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No hay grupos en el dominio todavía" />
        )}
      </CardContent>
    </Card>
  );
}

function ManageMemberPopover({ groupEmail }: { groupEmail: string }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const add = useAddGroupMember();
  const remove = useRemoveGroupMember();
  const pending = add.isPending || remove.isPending;

  function handleOpenChange(v: boolean) {
    if (!v) setEmail("");
    setOpen(v);
  }

  async function handleAdd() {
    if (!email.trim()) return;
    try {
      await add.mutateAsync({ groupEmail, memberEmail: email.trim() });
      toast.success("Miembro agregado");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleRemove() {
    if (!email.trim()) return;
    try {
      await remove.mutateAsync({ groupEmail, memberEmail: email.trim() });
      toast.success("Miembro quitado");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Miembros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2 p-3" align="end">
        <Label className="text-xs">Email del miembro</Label>
        <Input
          type="email"
          placeholder="alumno@colegio.edu.ar"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleAdd}
            disabled={pending || !email.trim()}
          >
            {add.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            Agregar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={handleRemove}
            disabled={pending || !email.trim()}
          >
            {remove.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserMinus className="h-3.5 w-3.5" />
            )}
            Quitar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
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
