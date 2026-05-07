"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/features/auth/useSession";
import { useLogout } from "@/features/auth/hooks";
import { DASHBOARD_PATH } from "@/config/roles";

export default function AccessDeniedPage() {
  return <AccessDeniedContent />;
}

function AccessDeniedContent() {
  const router = useRouter();
  const { role } = useSession();
  const logout = useLogout();

  const handleGoToDashboard = () => {
    if (role) {
      router.replace(DASHBOARD_PATH[role] ?? "/dashboard");
    } else {
      router.replace("/login");
    }
    router.refresh();
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto flex max-w-md items-center py-10">
      <Card className="w-full">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">No tenés acceso a esta sección</CardTitle>
            <CardDescription>
              Tu cuenta no tiene permiso para usar este recurso. Si necesitás
              acceso, hablalo con administración del colegio.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 pb-8 sm:flex-row">
          <Button className="flex-1" onClick={handleGoToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir a mi panel
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
