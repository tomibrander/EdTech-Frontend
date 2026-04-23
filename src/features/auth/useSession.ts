"use client";
import * as React from "react";
import type { User } from "@/types";
import type { Role } from "@/config/roles";
import { USER_COOKIE } from "@/lib/auth/cookies";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readUserFromCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${USER_COOKIE}=`));
  if (!match) return null;
  const raw = match.substring(USER_COOKIE.length + 1);
  const once = safeDecode(raw);
  try {
    return JSON.parse(once) as User;
  } catch {
    // fallback para cookies viejas double-encoded
    try {
      return JSON.parse(safeDecode(once)) as User;
    } catch {
      return null;
    }
  }
}

export function useSession() {
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => setUser(readUserFromCookie()), []);
  const role: Role | undefined = user?.role;
  return { user, role, isAuthenticated: !!user };
}
