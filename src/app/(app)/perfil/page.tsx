"use client";
import { Users } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { useGroups } from "@/features/workspace/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data/EmptyState";
import { RoleBadge } from "@/components/layout/RoleBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateTime } from "@/lib/utils";

export default function ProfilePage() {
  const { data, isLoading } = useCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Mi perfil" description="Datos de tu cuenta institucional" />
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Información vinculada a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <Row label="Nombre" value={data?.displayName} />
              <Row label="Email" value={data?.email} />
              <Row label="Rol" value={data?.role ? <RoleBadge role={data.role} /> : "—"} />
              <Row label="Google Account ID" value={data?.googleAccountId ?? "—"} mono />
              <Row label="Miembro desde" value={formatDateTime(data?.createdAt)} />
            </>
          )}
        </CardContent>
      </Card>
      <MyGroupsCard />
    </div>
  );
}

function MyGroupsCard() {
  const { data: groups, isLoading } = useGroups();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis grupos</CardTitle>
        <CardDescription>Grupos de Google Workspace a los que pertenecés</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : groups && groups.length > 0 ? (
          <ul className="divide-y">
            {groups.map((g) => (
              <li key={g.googleGroupId} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{g.name || g.email}</p>
                  <p className="text-xs text-muted-foreground">{g.email}</p>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <Users className="h-3 w-3" />
                  {g.memberCount}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No pertenecés a ningún grupo todavía" />
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 border-b py-2 last:border-0 sm:grid-cols-[180px_1fr]">
      <p className="text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-xs" : ""}>{value ?? "—"}</p>
    </div>
  );
}
