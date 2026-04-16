/**
 * WHITE-LABEL: configuración del tenant activo.
 *
 * Cómo agregar un nuevo tenant:
 *  1. Agregar una entrada en el objeto `tenants` con su id, nombre, colores, logo, features y textos.
 *  2. Copiar el logo/favicon a `public/tenants/<id>/`.
 *  3. Setear `NEXT_PUBLIC_TENANT=<id>` en el `.env.local` y rebuild.
 *
 * Los colores están en HSL (sin la función `hsl()`) porque se inyectan como CSS variables
 * y Tailwind los consume vía `hsl(var(--primary))`.
 */

export type HSL = { h: number; s: number; l: number };

export interface TenantConfig {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  supportEmail: string;
  logo: { light: string; dark: string };
  favicon: string;
  theme: {
    radius: string;
    colors: {
      primary: HSL;
      primaryForeground: HSL;
      secondary: HSL;
      secondaryForeground: HSL;
      accent: HSL;
      accentForeground: HSL;
      background: HSL;
      foreground: HSL;
      card: HSL;
      cardForeground: HSL;
      muted: HSL;
      mutedForeground: HSL;
      border: HSL;
      input: HSL;
      ring: HSL;
      destructive: HSL;
      destructiveForeground: HSL;
      success: HSL;
      successForeground: HSL;
      warning: HSL;
      warningForeground: HSL;
    };
  };
  features: {
    admisiones: boolean;
    postulacionesLaborales: boolean;
    classroomAI: boolean;
    workspaceAdmin: boolean;
    mensajes: boolean;
    anuncios: boolean;
  };
  textos: {
    loginTitle: string;
    loginSubtitle: string;
    heroLine: string;
    footerNote: string;
  };
}

const defaultTenant: TenantConfig = {
  id: "default",
  name: "Campus Educativo",
  shortName: "Campus",
  domain: "colegio.edu.ar",
  supportEmail: "soporte@colegio.edu.ar",
  logo: { light: "/tenants/default/logo.svg", dark: "/tenants/default/logo-dark.svg" },
  favicon: "/tenants/default/favicon.svg",
  theme: {
    radius: "0.75rem",
    colors: {
      primary: { h: 221, s: 83, l: 53 },
      primaryForeground: { h: 0, s: 0, l: 100 },
      secondary: { h: 210, s: 40, l: 96 },
      secondaryForeground: { h: 222, s: 47, l: 11 },
      accent: { h: 142, s: 71, l: 45 },
      accentForeground: { h: 0, s: 0, l: 100 },
      background: { h: 0, s: 0, l: 100 },
      foreground: { h: 222, s: 47, l: 11 },
      card: { h: 0, s: 0, l: 100 },
      cardForeground: { h: 222, s: 47, l: 11 },
      muted: { h: 210, s: 40, l: 96 },
      mutedForeground: { h: 215, s: 16, l: 47 },
      border: { h: 214, s: 32, l: 91 },
      input: { h: 214, s: 32, l: 91 },
      ring: { h: 221, s: 83, l: 53 },
      destructive: { h: 0, s: 84, l: 60 },
      destructiveForeground: { h: 0, s: 0, l: 100 },
      success: { h: 142, s: 71, l: 45 },
      successForeground: { h: 0, s: 0, l: 100 },
      warning: { h: 38, s: 92, l: 50 },
      warningForeground: { h: 26, s: 83, l: 14 },
    },
  },
  features: {
    admisiones: true,
    postulacionesLaborales: true,
    classroomAI: true,
    workspaceAdmin: true,
    mensajes: true,
    anuncios: true,
  },
  textos: {
    loginTitle: "Campus virtual",
    loginSubtitle: "Accedé con tu cuenta institucional",
    heroLine: "Tu espacio educativo, en un solo lugar.",
    footerNote: "Potenciado por Campus Educativo",
  },
};

const sanMartinTenant: TenantConfig = {
  ...defaultTenant,
  id: "san-martin",
  name: "Colegio San Martín",
  shortName: "CSM",
  domain: "sanmartin.edu.ar",
  supportEmail: "soporte@sanmartin.edu.ar",
  logo: {
    light: "/tenants/san-martin/logo.svg",
    dark: "/tenants/san-martin/logo-dark.svg",
  },
  favicon: "/tenants/san-martin/favicon.svg",
  theme: {
    ...defaultTenant.theme,
    colors: {
      ...defaultTenant.theme.colors,
      primary: { h: 356, s: 75, l: 45 },
      ring: { h: 356, s: 75, l: 45 },
      accent: { h: 38, s: 92, l: 50 },
    },
  },
  textos: {
    loginTitle: "Campus Colegio San Martín",
    loginSubtitle: "Ingresá con tu cuenta institucional",
    heroLine: "Educación de excelencia desde 1952.",
    footerNote: "© Colegio San Martín",
  },
};

const tenants: Record<string, TenantConfig> = {
  default: defaultTenant,
  "san-martin": sanMartinTenant,
};

const activeId = process.env.NEXT_PUBLIC_TENANT ?? "default";
export const tenantConfig: TenantConfig = tenants[activeId] ?? defaultTenant;

/** Serializa un HSL a string `"H S% L%"` para usar en CSS variables. */
export function hsl(v: HSL): string {
  return `${v.h} ${v.s}% ${v.l}%`;
}

/** Devuelve todas las CSS variables del tema actual como string inline. */
export function tenantCssVariables(t: TenantConfig = tenantConfig): string {
  const c = t.theme.colors;
  return [
    `--radius:${t.theme.radius}`,
    `--background:${hsl(c.background)}`,
    `--foreground:${hsl(c.foreground)}`,
    `--card:${hsl(c.card)}`,
    `--card-foreground:${hsl(c.cardForeground)}`,
    `--popover:${hsl(c.card)}`,
    `--popover-foreground:${hsl(c.cardForeground)}`,
    `--primary:${hsl(c.primary)}`,
    `--primary-foreground:${hsl(c.primaryForeground)}`,
    `--secondary:${hsl(c.secondary)}`,
    `--secondary-foreground:${hsl(c.secondaryForeground)}`,
    `--muted:${hsl(c.muted)}`,
    `--muted-foreground:${hsl(c.mutedForeground)}`,
    `--accent:${hsl(c.accent)}`,
    `--accent-foreground:${hsl(c.accentForeground)}`,
    `--destructive:${hsl(c.destructive)}`,
    `--destructive-foreground:${hsl(c.destructiveForeground)}`,
    `--success:${hsl(c.success)}`,
    `--success-foreground:${hsl(c.successForeground)}`,
    `--warning:${hsl(c.warning)}`,
    `--warning-foreground:${hsl(c.warningForeground)}`,
    `--border:${hsl(c.border)}`,
    `--input:${hsl(c.input)}`,
    `--ring:${hsl(c.ring)}`,
  ].join(";");
}
