import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE_URL } from "@/lib/api/client";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignoramos: igual limpiamos cookies locales
    }
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
