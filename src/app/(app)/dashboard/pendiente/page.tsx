"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, LogOut, Mail } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/useSession";
import { useLogout } from "@/features/auth/hooks";
import { tenantConfig } from "@/config/tenant.config";

export default function PendientePage() {
  const { user } = useSession();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.displayName ?? ""}`}
        description="Tu cuenta fue creada correctamente, pero todavía no tiene un rol asignado."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-warning" />
            Esperando aprobación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Iniciaste sesión con <strong>{user?.email}</strong>. Un administrador
            del colegio tiene que aprobar tu cuenta y asignarte un rol (docente,
            alumno, padre/madre, director). Mientras tanto no podés acceder a
            cursos, calificaciones ni mensajes.
          </p>
          <p>
            Si pensás que esto es un error, contactá al administrador del
            colegio y mencioná tu email institucional.
          </p>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={`mailto:${tenantConfig.supportEmail}?subject=${encodeURIComponent(
                  "Cuenta pendiente de aprobación",
                )}&body=${encodeURIComponent(
                  `Hola, mi cuenta ${user?.email} está pendiente de aprobación.`,
                )}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contactar soporte
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
