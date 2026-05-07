"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Ban,
  Check,
  Copy,
  ExternalLink,
  FolderTree,
  KeyRound,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type Role } from "@/config/roles";
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
  useResetWorkspacePassword,
  useSuspendUser,
  useWorkspaceUsers,
} from "@/features/workspace/hooks";
import { formatDate } from "@/lib/utils";

interface CredentialsModalState {
  email: string;
  password: string;
  isReset?: boolean;
  assignedRole?: Role;
}

const CREATABLE_ROLES: Role[] = [
  "pendiente",
  "docente",
  "alumno",
  "padre",
  "director",
];

export default function WorkspaceUsersPage() {
  const [credentials, setCredentials] = React.useState<CredentialsModalState | null>(
    null,
  );

  return (
    <RoleGate roles={["superadmin"]}>
      <div className="space-y-6">
        <PageHeader
          title="Google Workspace · Usuarios"
          description="Administración de cuentas institucionales"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <CreateUserCard onCredentials={setCredentials} />
          <MoveOUCard />
          <SuspendUserCard />
        </div>

        <UsersTable onCredentials={setCredentials} />

        <CredentialsDialog
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      </div>
    </RoleGate>
  );
}

function CreateUserCard({
  onCredentials,
}: {
  onCredentials: (c: CredentialsModalState) => void;
}) {
  const create = useCreateWorkspaceUser();
  const { register, handleSubmit, reset, watch, setValue } = useForm<{
    firstName: string;
    lastName: string;
    institutionalEmail: string;
    orgUnitPath: string;
    role: Role;
  }>({ defaultValues: { orgUnitPath: "/", role: "pendiente" } });

  const role = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await create.mutateAsync(values);
      reset({ orgUnitPath: "/", role: "pendiente" });
      if (result.workspaceUser.temporaryPassword) {
        onCredentials({
          email: result.workspaceUser.institutionalEmail,
          password: result.workspaceUser.temporaryPassword,
          assignedRole: result.appUser.role as Role,
        });
      } else {
        toast.success(
          `Cuenta creada: ${result.workspaceUser.institutionalEmail}`,
        );
      }
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
          Crea la cuenta en Google Workspace y la registra en la app con el rol
          elegido. La contraseña inicial es de un solo uso.
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
          <Field label="Rol en la app">
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as Role)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREATABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "pendiente"
                ? "Se va a crear sin permisos. Lo aprobás más tarde."
                : "Se le asigna el rol al instante."}
            </p>
          </Field>
          <Button type="submit" disabled={create.isPending} className="w-full">
            {create.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
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

function UsersTable({
  onCredentials,
}: {
  onCredentials: (c: CredentialsModalState) => void;
}) {
  const [filter, setFilter] = React.useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useWorkspaceUsers();
  const resetPwd = useResetWorkspacePassword();
  const [resettingId, setResettingId] = React.useState<string | null>(null);

  const handleResetPassword = async (userKey: string, email: string) => {
    if (
      !confirm(
        `¿Resetear la contraseña de ${email}? Se generará una nueva password temporal y la actual dejará de funcionar.`,
      )
    )
      return;
    setResettingId(userKey);
    try {
      const result = await resetPwd.mutateAsync(userKey);
      onCredentials({
        email: result.institutionalEmail,
        password: result.temporaryPassword,
        isReset: true,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setResettingId(null);
    }
  };

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
                <TableHead className="text-right">Acciones</TableHead>
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={resettingId === u.googleAccountId}
                      onClick={() =>
                        handleResetPassword(
                          u.googleAccountId,
                          u.institutionalEmail,
                        )
                      }
                    >
                      {resettingId === u.googleAccountId ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-3.5 w-3.5" />
                      )}
                      Resetear contraseña
                    </Button>
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

function CredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: CredentialsModalState | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState<"email" | "password" | null>(null);

  React.useEffect(() => {
    if (!credentials) setCopied(null);
  }, [credentials]);

  const copy = async (value: string, key: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Dialog open={!!credentials} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {credentials?.isReset
              ? "Contraseña reseteada"
              : "Cuenta creada en Google Workspace"}
          </DialogTitle>
          <DialogDescription>
            Esta es la <strong>única vez</strong> que vas a ver esta contraseña.
            Copiala y pasásela al usuario. Tiene que cambiarla obligatoriamente
            en el primer login.
            {credentials?.assignedRole && !credentials.isReset && (
              <span className="mt-2 block">
                Rol asignado en la app:{" "}
                <strong>{ROLE_LABELS[credentials.assignedRole]}</strong>
                {credentials.assignedRole === "pendiente" && (
                  <> (queda esperando aprobación).</>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {credentials && (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={credentials.email} className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copy(credentials.email, "email")}
                  aria-label="Copiar email"
                >
                  {copied === "email" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Contraseña temporal</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={credentials.password}
                  className="font-mono text-sm tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copy(credentials.password, "password")}
                  aria-label="Copiar contraseña"
                >
                  {copied === "password" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Próximos pasos:</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>
                  Pasale al usuario el email y la contraseña por un canal seguro.
                </li>
                <li>
                  Que entre a{" "}
                  <a
                    href="https://accounts.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-primary hover:underline"
                  >
                    accounts.google.com
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  con esos datos.
                </li>
                <li>Google le va a pedir que defina una nueva contraseña.</li>
                <li>
                  Después, en el login de la app, va a poder usar el botón
                  &quot;Continuar con Google&quot;.
                </li>
              </ol>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
