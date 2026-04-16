import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

const AUTHED_ROUTES = [
  "/dashboard",
  "/alumnos",
  "/cursos",
  "/asistencia",
  "/mensajes",
  "/anuncios",
  "/classroom",
  "/admisiones",
  "/workspace",
  "/perfil",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = AUTHED_ROUTES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (access || refresh) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
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
    "/workspace/:path*",
    "/perfil/:path*",
  ],
};
