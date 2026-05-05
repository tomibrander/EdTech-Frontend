"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Ban,
  FolderTree,
  Loader2,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/data/EmptyState";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  useCreateWorkspaceUser,
  useMoveUserOU,
  useSuspendUser,
  useWorkspaceUsers,
} from "@/features/workspace/hooks";
import { formatDate } from "@/lib/utils";

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

        <UsersTable />
      </div>
    </RoleGate>
  );
}

function CreateUserCard() {
  const create = useCreateWorkspaceUser();
  const { register, handleSubmit, reset } = useForm<{
    firstName: string;
    lastName: string;
    institutionalEmail: string;
    orgUnitPath: string;
  }>({ defaultValues: { orgUnitPath: "/" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await create.mutateAsync(values);
      toast.success(
        `Cuenta creada: ${created.institutionalEmail}. Contraseña temporal generada por Workspace.`,
      );
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
        <CardDescription>
          La contraseña inicial la genera Workspace y se obliga a cambiarla en
          el primer login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <Input {...register("firstName", { required: true })} />
            </Field>
            <Field label="Apellido">
              <Input {...register("lastName", { required: true })} />
            </Field>
          </div>
          <Field label="Email institucional">
            <Input
              type="email"
              placeholder="alumno@dominio.edu"
              {...register("institutionalEmail", { required: true })}
            />
          </Field>
          <Field label="OU">
            <Input
              placeholder="/Alumnos/2026"
              {...register("orgUnitPath", { required: true })}
            />
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
    googleId: string;
    orgUnitPath: string;
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
          <Field label="Google ID o email del usuario">
            <Input {...register("googleId", { required: true })} />
          </Field>
          <Field label="Nueva OU">
            <Input
              placeholder="/Alumnos/2026"
              {...register("orgUnitPath", { required: true })}
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
  const { register, handleSubmit, reset } = useForm<{ googleId: string }>();

  const onSubmit = handleSubmit(async ({ googleId }) => {
    if (!confirm("¿Seguro que querés suspender esta cuenta?")) return;
    try {
      await suspend.mutateAsync(googleId);
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
          <Field label="Google ID o email">
            <Input {...register("googleId", { required: true })} />
          </Field>
          <Button
            type="submit"
            variant="destructive"
            disabled={suspend.isPending}
            className="w-full"
          >
            {suspend.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Suspender
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UsersTable() {
  const [filter, setFilter] = React.useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useWorkspaceUsers();

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (u) =>
        u.institutionalEmail.toLowerCase().includes(q) ||
        u.orgUnitPath.toLowerCase().includes(q),
    );
  }, [data, filter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Usuarios del dominio
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} cuentas` : "Cargando…"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filtrar por email u OU"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refrescar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="No se pudieron cargar los usuarios"
            description={
              error instanceof Error ? error.message : "Reintentá en unos segundos"
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin resultados"
            description={data?.length ? "Probá con otro filtro" : undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Google ID</TableHead>
                <TableHead>OU</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.googleAccountId}>
                  <TableCell className="font-medium">
                    {u.institutionalEmail}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {u.googleAccountId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.orgUnitPath}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.suspended ? "destructive" : "default"}>
                      {u.suspended ? "Suspendido" : "Activo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
