import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE_URL } from "@/lib/api/client";
import { REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "NO_REFRESH_TOKEN" }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!upstream.ok) {
    const res = NextResponse.json({ error: "REFRESH_FAILED" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const data = (await upstream.json()) as { accessToken: string; refreshToken?: string };
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return res;
}
