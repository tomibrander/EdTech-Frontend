# EdTech Frontend · White-label

Frontend en **Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query** que consume la API definida en `swagger.yaml`.

Está pensado para ser **white-label**: cada organización educativa tiene su propia configuración (logo, colores, textos, feature flags) y se despliega con un build dedicado.

## Requisitos

- Node.js **20+**
- npm / pnpm / yarn
- Backend corriendo con las rutas definidas en [`swagger.yaml`](./swagger.yaml)

## Primeros pasos

```bash
npm install
cp .env.example .env.local      # editá NEXT_PUBLIC_API_URL y NEXT_PUBLIC_TENANT
npm run gen:api                 # opcional: regenera tipos desde swagger.yaml
npm run dev                     # http://localhost:3000
```

## Variables de entorno

| Variable              | Descripción                                                   |
| --------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej `http://localhost:3000/v1`).          |
| `NEXT_PUBLIC_TENANT`  | Id del tenant activo (se resuelve en `src/config/tenant.config.ts`). |

## Arquitectura

```
src/
  app/
    (public)/              # /login, /forgot-password, /reset-password, /admision/*
    (app)/                 # Rutas autenticadas con sidebar + topbar
      dashboard/{alumno|docente|director|padre}
      admisiones/{prospectos|laborales}
      alumnos/{id}
      cursos/{id}
      asistencia
      mensajes
      anuncios
      classroom/{asistente|cursos/[id]/...}
      workspace/{usuarios|grupos}
      perfil
    api/
      auth/{login|logout|refresh|me}    # Route handlers con cookies httpOnly
      proxy/[...path]                   # Proxy autenticado al backend
  components/
    ui/                    # Primitivos shadcn (Button, Card, Dialog, etc.)
    layout/                # Sidebar, Topbar, TenantLogo, Breadcrumbs, RoleBadge
    data/                  # StatCard, EmptyState, StatusBadge, Pagination
    auth/RoleGate          # Oculta UI por rol
  features/                # Código por dominio: hooks + schemas Zod
    auth/ admissions/ students/ courses/ attendance/
    messages/ classroom/ workspace/ dashboard/
  lib/
    api/client.ts          # Axios + interceptor de refresh
    auth/cookies.ts        # Helpers de cookies seguras
    auth/session.ts        # getServerSession() para Server Components
    query/client.ts        # QueryClient compartido
    utils.ts               # cn, formatDate (es-AR), etc.
  config/
    tenant.config.ts       # ⭐ Configuración white-label
    roles.ts               # Roles + DASHBOARD_PATH
    nav.ts                 # Estructura del sidebar (filtrada por feature flag + rol)
  types/index.ts           # Tipos de dominio
  middleware.ts            # Auth guard para (app)/*
public/
  tenants/<id>/            # Assets del tenant (logo, favicon)
```

## Autenticación

- El usuario hace `POST /api/auth/login` (Next Route Handler), que llama al backend y guarda **access + refresh tokens** en cookies **httpOnly**.
- El cliente hace requests a `/api/proxy/<ruta>`, que a su vez inyecta el `Authorization: Bearer ...` antes de reenviar al backend. De esta forma el token **nunca está accesible desde JavaScript**.
- Al recibir un 401, el interceptor de Axios llama a `/api/auth/refresh` (una vez) y reintenta. Si falla, redirige a `/login`.
- `middleware.ts` protege todas las rutas de `(app)/*` exigiendo la cookie.
- `useSession()` (cliente) lee el usuario desde una cookie pública (no sensible, solo id/email/rol/displayName).
- `getServerSession()` (server) se usa en Server Components para decidir redirects.

## Roles

Los roles soportados (`src/config/roles.ts`):

- `alumno` · `padre` · `docente` · `director` · `superadmin`

Cada uno ve distinto sidebar y dashboard. Se puede proteger UI con `<RoleGate roles={["superadmin","director"]}>...</RoleGate>`.

## Cómo crear un nuevo tenant

Objetivo: lanzar una instancia del colegio **Colegio Aurora** con logo, colores y nombre propios.

1. **Assets**. Creá `public/tenants/aurora/` con:

   - `logo.svg` (monocromo `currentColor`, se usa en sidebar y login)
   - `logo-dark.svg`
   - `favicon.svg`

2. **Configuración**. Agregá en `src/config/tenant.config.ts` una nueva entrada en el `Record<string, TenantConfig>`:

   ```ts
   const auroraTenant: TenantConfig = {
     ...defaultTenant,
     id: "aurora",
     name: "Colegio Aurora",
     shortName: "Aurora",
     domain: "colegioaurora.edu.ar",
     supportEmail: "soporte@colegioaurora.edu.ar",
     logo: {
       light: "/tenants/aurora/logo.svg",
       dark: "/tenants/aurora/logo-dark.svg",
     },
     favicon: "/tenants/aurora/favicon.svg",
     theme: {
       ...defaultTenant.theme,
       colors: {
         ...defaultTenant.theme.colors,
         primary: { h: 265, s: 70, l: 50 }, // violeta
         ring: { h: 265, s: 70, l: 50 },
         accent: { h: 38, s: 92, l: 50 },   // dorado
       },
     },
     features: {
       ...defaultTenant.features,
       workspaceAdmin: false, // ocultar módulo
     },
     textos: {
       loginTitle: "Campus Aurora",
       loginSubtitle: "Ingresá con tu cuenta institucional",
       heroLine: "Educar es iluminar.",
       footerNote: "© Colegio Aurora",
     },
   };
   ```

   Y registralo en el mapa `tenants`:

   ```ts
   const tenants: Record<string, TenantConfig> = {
     default: defaultTenant,
     "san-martin": sanMartinTenant,
     aurora: auroraTenant, // ← nuevo
   };
   ```

3. **Build + deploy**. Tiramos un build específico:

   ```bash
   NEXT_PUBLIC_TENANT=aurora NEXT_PUBLIC_API_URL=https://api.aurora.edu.ar/v1 npm run build
   ```

   Cada organización tiene su propio deploy, así se mantiene simple y cada tenant puede apuntar a su propio dominio/backend.

Los **colores se aplican como CSS variables** (`hsl(var(--primary))` etc.), así que todo el sistema visual (Tailwind, shadcn, StatusBadge, StatCard) se re-colorea con sólo cambiar el tenant.

### Feature flags

`tenant.config.ts` tiene una sección `features` que habilita/deshabilita módulos enteros del sidebar:

```ts
features: {
  admisiones: true,
  postulacionesLaborales: true,
  classroomAI: true,
  workspaceAdmin: true,
  mensajes: true,
  anuncios: true,
}
```

Poner `classroomAI: false` esconde inmediatamente el item "Asistente IA" del menú.

## Scripts

- `npm run dev` – servidor de desarrollo (Next 15 + Turbopack).
- `npm run build` – build de producción.
- `npm run start` – servidor de producción.
- `npm run lint` – ESLint (Next config).
- `npm run gen:api` – regenera `src/lib/api/generated-types.ts` desde `swagger.yaml` con `openapi-typescript`.

## Cosas a saber

- Todas las fechas se muestran con `date-fns` locale `es-AR` en `formatDate`/`formatDateTime`/`fromNow` de `src/lib/utils.ts`.
- Los formularios usan **React Hook Form + Zod**; los schemas viven en `features/<modulo>/schemas.ts`.
- La caché de servidor usa TanStack Query v5 con `staleTime: 30s` y `retry: 2` (excepto 401/403/404 que no retryan).
- La grilla de asistencia es **cliente-side optimista**: marcás todo presente por defecto, tocás los que faltan o llegan tarde, y guardás en bloque.
- El asistente IA guarda el historial sólo en memoria del cliente (no persiste). El backend responde `{ answer, sources }`.

## Próximos pasos sugeridos

- Reportes PDF por alumno (boletín de calificaciones y asistencia).
- Modo oscuro: agregar un conjunto de vars `.dark` en `tenant.config.ts` y usar `next-themes`.
- Push notifications / emails para anuncios programados.
- Agregar tests E2E con Playwright sobre flujos críticos (login, alta de prospecto, carga de notas).
