import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * Cliente HTTP compartido.
 *
 * - En el navegador llama a `/api/proxy/...` (Route Handler en Next) que reenvía al backend
 *   con el access token que vive en la cookie httpOnly. Esto evita exponer tokens al JS.
 * - En server components / route handlers usamos `serverApi(token)` directamente contra el backend.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export const BACKEND_BASE_URL = BACKEND_URL;

/** Axios cliente para usar desde componentes cliente. Pasa por el proxy de Next. */
export const api: AxiosInstance = axios.create({
  baseURL: "/api/proxy",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshWaiters: ((ok: boolean) => void)[] = [];

function waitForRefresh(): Promise<boolean> {
  return new Promise((resolve) => refreshWaiters.push(resolve));
}

function resolveRefresh(ok: boolean) {
  refreshWaiters.forEach((cb) => cb(ok));
  refreshWaiters = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    // evita bucle con el propio refresh
    if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      const ok = await waitForRefresh();
      if (!ok) return Promise.reject(error);
      return api(original);
    }

    try {
      isRefreshing = true;
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const ok = refreshRes.ok;
      resolveRefresh(ok);
      if (!ok) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }
      return api(original);
    } catch (e) {
      resolveRefresh(false);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

/** Cliente pensado para server components: recibe el token y pega directo al backend. */
export function serverApi(accessToken?: string | null): AxiosInstance {
  return axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; fields?: { field: string; message: string }[] }
      | undefined;
    if (data?.fields?.length) {
      return data.fields.map((f) => `${f.field}: ${f.message}`).join(" · ");
    }
    return data?.message ?? data?.error ?? err.message;
  }
  return err instanceof Error ? err.message : "Error desconocido";
}
