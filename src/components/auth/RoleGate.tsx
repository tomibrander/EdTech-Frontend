"use client";
import type { Role } from "@/config/roles";
import { useSession } from "@/features/auth/useSession";

export function RoleGate({
  roles,
  fallback = null,
  children,
}: {
  roles: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { role } = useSession();
  if (!role || !roles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
