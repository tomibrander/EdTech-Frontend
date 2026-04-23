import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "edu_access";
export const REFRESH_COOKIE = "edu_refresh";
export const USER_COOKIE = "edu_user";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  res: NextResponse,
  {
    accessToken,
    refreshToken,
    user,
  }: { accessToken: string; refreshToken?: string; user?: unknown }
) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1h
  });
  if (refreshToken) {
    res.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30d
    });
  }
  if (user) {
    // público, accesible desde el middleware para leer el rol (no sensible).
    // NextResponse.cookies.set() ya url-encodea el value, por eso NO hacemos
    // encodeURIComponent acá (si no, queda double-encoded y el cliente no lo puede parsear).
    res.cookies.set(USER_COOKIE, JSON.stringify(user), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  res.cookies.delete(USER_COOKIE);
}
