import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
} from "@/lib/auth/cookies";

const AUTHED_ROUTES = [
  "/dashboard",
  "/alumnos",
  "/cursos",
  "/asistencia",
  "/mensajes",
  "/anuncios",
  "/classroom",
  "/admisiones",
  "/admin",
  "/workspace",
  "/perfil",
  "/acceso-denegado",
];

const PENDIENTE_PATH = "/dashboard/pendiente";
const ACCESS_DENIED_PATH = "/acceso-denegado";

function readRole(req: NextRequest): string | undefined {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return undefined;
  try {
    const u = JSON.parse(raw) as { role?: string };
    return u.role;
  } catch {
    try {
      const u = JSON.parse(decodeURIComponent(raw)) as { role?: string };
      return u.role;
    } catch {
      return undefined;
    }
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = AUTHED_ROUTES.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const role = readRole(req);
  if (
    role === "pendiente" &&
    !pathname.startsWith(PENDIENTE_PATH) &&
    !pathname.startsWith(ACCESS_DENIED_PATH)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = PENDIENTE_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/alumnos/:path*",
    "/cursos/:path*",
    "/asistencia/:path*",
    "/mensajes/:path*",
    "/anuncios/:path*",
    "/classroom/:path*",
    "/admisiones/:path*",
    "/admin/:path*",
    "/workspace/:path*",
    "/perfil/:path*",
    "/acceso-denegado",
  ],
};
