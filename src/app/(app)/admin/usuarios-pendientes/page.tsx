"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RefreshCw, UserCog, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/data/EmptyState";
import { RoleGate } from "@/components/auth/RoleGate";
import {
  useAppUsers,
  useAssignRole,
  usePendingUsers,
  useReconcileStudents,
  type AppUser,
} from "@/features/users/hooks";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/client";

const ASSIGNABLE_ROLES: Role[] = [
  "director",
  "docente",
  "alumno",
  "padre",
];

export default function PendingUsersPage() {
  return (
    <RoleGate roles={["superadmin"]}>
      <div className="space-y-6">
        <PageHeader
          title="Aprobar usuarios pendientes"
          description="Asigná el rol a quienes ingresaron con Google y todavía no tienen permisos."
        />

        <PendingTable />

        <AllUsersTable />
      </div>
    </RoleGate>
  );
}

function PendingTable() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePendingUsers();

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4 text-warning" />
            Pendientes de aprobación
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} usuarios esperando rol` : "Cargando…"}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refrescar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="No se pudieron cargar los pendientes"
            description={getApiErrorMessage(error)}
          />
        ) : !data?.length ? (
          <EmptyState
            icon={CheckCircle2}
            title="No hay usuarios pendientes"
            description="Cuando alguien nuevo se loguee con Google, va a aparecer acá."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Primer login</TableHead>
                <TableHead className="w-[280px]">Asignar rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((u) => (
                <PendingUserRow key={u.id} user={u} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PendingUserRow({ user }: { user: AppUser }) {
  const [selected, setSelected] = React.useState<Role | "">("");
  const assign = useAssignRole();

  const onAssign = async () => {
    if (!selected) {
      toast.error("Elegí un rol");
      return;
    }
    try {
      await assign.mutateAsync({ id: user.id, role: selected as Role });
      toast.success(
        `${user.email} ahora es ${ROLE_LABELS[selected as Role]}`,
      );
      setSelected("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.displayName}</TableCell>
      <TableCell>
        <Badge variant={user.authProvider === "google" ? "default" : "secondary"}>
          {user.authProvider === "google" ? "Google SSO" : "Password"}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select
            value={selected}
            onValueChange={(v) => setSelected(v as Role)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Elegir rol…" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!selected || assign.isPending}
            onClick={onAssign}
          >
            {assign.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Aprobar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AllUsersTable() {
  const [filter, setFilter] = React.useState("");
  const { data, isLoading } = useAppUsers();
  const assign = useAssignRole();
  const reconcile = useReconcileStudents();
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q),
    );
  }, [data, filter]);

  const onChangeRole = async (user: AppUser, role: Role) => {
    if (role === user.role) return;
    setEditingId(user.id);
    try {
      await assign.mutateAsync({ id: user.id, role });
      toast.success(`${user.email}: ${ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setEditingId(null);
    }
  };

  const onReconcileStudents = async () => {
    try {
      const result = await reconcile.mutateAsync();
      toast.success(
        `Reconciliación completa: ${result.createdStudents} creados, ${result.updatedStudents} actualizados (${result.processedUsers} usuarios alumno procesados).`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Todos los usuarios de la app
          </CardTitle>
          <CardDescription>
            Cambiá el rol de cualquier usuario activo. Los pendientes aparecen también arriba.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReconcileStudents}
            disabled={reconcile.isPending}
          >
            {reconcile.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Reconciliar alumnos
          </Button>
          <input
            type="text"
            placeholder="Filtrar por email o nombre"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
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
                <TableHead>Nombre</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead className="w-[200px]">Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.displayName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.authProvider === "google" ? "default" : "secondary"
                      }
                    >
                      {u.authProvider === "google" ? "Google SSO" : "Password"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={u.role}
                        onValueChange={(v) => onChangeRole(u, v as Role)}
                        disabled={editingId === u.id}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["pendiente", ...ASSIGNABLE_ROLES, "superadmin"] as Role[]).map(
                            (r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {editingId === u.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>
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
