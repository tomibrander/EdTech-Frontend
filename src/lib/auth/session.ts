import { cookies } from "next/headers";
import { ACCESS_COOKIE, USER_COOKIE, REFRESH_COOKIE } from "./cookies";
import type { User } from "@/types";

export async function getServerSession(): Promise<{
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value ?? null;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value ?? null;
  const raw = jar.get(USER_COOKIE)?.value;
  let user: User | null = null;
  if (raw) {
    // `cookies().get().value` ya viene url-decodeado. Mantenemos un fallback
    // por si la cookie fue seteada con encoding manual (versiones previas).
    try {
      user = JSON.parse(raw) as User;
    } catch {
      try {
        user = JSON.parse(decodeURIComponent(raw)) as User;
      } catch {
        user = null;
      }
    }
  }
  return { user, accessToken, refreshToken };
}
