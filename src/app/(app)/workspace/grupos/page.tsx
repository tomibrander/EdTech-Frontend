"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, GraduationCap, Loader2, UserMinus, UserPlus, Users } from "lucide-react";

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
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAddGroupMember,
  useCreateGroup,
  useGroupMembers,
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{g.name || g.email}</p>
                    {g.linkedCourseCode && (
                      <Link href={`/cursos/${g.linkedCourseCode}`}>
                        <Badge variant="secondary" className="gap-1 text-[11px]">
                          <GraduationCap className="h-3 w-3" />
                          {g.linkedCourseName ?? g.linkedCourseCode}
                        </Badge>
                      </Link>
                    )}
                  </div>
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
  const { data: members, isFetching: loadingMembers } = useGroupMembers(groupEmail, open);
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
      setEmail("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleRemoveByEmail(memberEmail: string) {
    try {
      await remove.mutateAsync({ groupEmail, memberEmail });
      toast.success("Miembro quitado");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Miembros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 p-3" align="end">
        <div>
          <Label className="text-xs text-muted-foreground">
            Miembros actuales
          </Label>
          <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
            {loadingMembers && (
              <p className="py-2 text-center text-xs text-muted-foreground">Cargando…</p>
            )}
            {!loadingMembers && members?.length === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Sin miembros
              </p>
            )}
            {members?.map((m) => (
              <div
                key={m.email}
                className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-sm hover:bg-accent"
              >
                <span className="truncate">{m.email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveByEmail(m.email)}
                  disabled={pending}
                  className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50"
                  aria-label={`Quitar a ${m.email}`}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t pt-2">
          <Label className="text-xs">Agregar por email</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="alumno@colegio.edu.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleAdd}
              disabled={pending || !email.trim()}
            >
              {add.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
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
      toast.error(getApiErrorMessage(err));
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
