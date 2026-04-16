import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/client";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  const body = await req.json();
  const upstream = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const tokens = data as { accessToken: string; refreshToken: string; user: unknown };
  const res = NextResponse.json({ user: tokens.user });
  setAuthCookies(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: tokens.user,
  });
  return res;
}
