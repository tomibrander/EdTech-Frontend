import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE_URL } from "@/lib/api/client";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/**
 * Proxy hacia el backend. Usa el access token httpOnly para autenticar.
 * Ruta: /api/proxy/<ruta backend>  →  <BACKEND_BASE_URL>/<ruta backend>
 */

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;

  const search = req.nextUrl.search ?? "";
  const target = `${BACKEND_BASE_URL}/${path.join("/")}${search}`;

  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type" as keyof HeadersInit] = contentType;

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: body && body.length ? body : undefined,
    cache: "no-store",
  });

  const responseText = await upstream.text();
  const resHeaders = new Headers();
  const upstreamCt = upstream.headers.get("content-type");
  if (upstreamCt) resHeaders.set("content-type", upstreamCt);

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
