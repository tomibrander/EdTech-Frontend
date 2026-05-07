"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/config/roles";
import { useSession } from "@/features/auth/useSession";

interface RoleGateProps {
  roles: Role[];
  /**
   * Si se provee, se renderiza en lugar de redirigir cuando el rol no
   * coincide. Útil cuando querés un mensaje inline sin sacar al usuario
   * de la página actual.
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGate({ roles, fallback, children }: RoleGateProps) {
  const { role } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const allowed = mounted && !!role && roles.includes(role);

  React.useEffect(() => {
    if (!mounted) return;
    if (allowed) return;
    if (fallback !== undefined) return;
    if (!pathname) return;
    if (pathname.startsWith("/acceso-denegado")) return;
    const params = new URLSearchParams({
      from: pathname,
      reason: "Tu rol no tiene permiso para esta sección",
    });
    router.replace(`/acceso-denegado?${params.toString()}`);
  }, [allowed, fallback, mounted, pathname, router]);

  // Keep SSR and first client render identical to avoid hydration mismatch.
  if (!mounted) return null;
  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return null;
}
