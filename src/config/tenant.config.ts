/**
 * WHITE-LABEL: configuración del tenant activo.
 *
 * Cómo agregar un nuevo tenant:
 *  1. Agregar una entrada en el objeto `tenants` con su id, nombre, colores, logo, features y textos.
 *  2. Copiar el logo/favicon a `public/tenants/<id>/`.
 *  3. Setear `NEXT_PUBLIC_TENANT=<id>` en el `.env.local` y rebuild.
 *
 * IMPORTANTE: los neutros (background/card/muted/border) del defaultTenant
 * tienen tono cálido (hue ~38° = paper). Cualquier tenant que solo cambia su
 * primary hereda esta calidez. Si un tenant quiere look 100% neutro/blanco,
 * tiene que sobrescribir explícitamente esos campos.
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
    motivationalPhrases: string[];
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
      // Tenant brand — ochre cálido por default
      primary:              { h: 28, s: 55, l: 45 },
      primaryForeground:    { h: 38, s: 50, l: 98 },
      ring:                 { h: 28, s: 55, l: 45 },
      accent:               { h: 28, s: 55, l: 92 },
      accentForeground:     { h: 28, s: 60, l: 28 },

      // Producto — paper warm neutrals (hue 38°)
      background:           { h: 38, s: 50, l: 93 }, // paper
      foreground:            { h: 30, s: 25, l: 12 }, // ink cálido
      card:                 { h: 38, s: 50, l: 96 }, // cream
      cardForeground:       { h: 30, s: 25, l: 12 },
      muted:                { h: 38, s: 30, l: 88 },
      mutedForeground:      { h: 35, s: 18, l: 38 },
      border:               { h: 38, s: 30, l: 82 },
      input:                { h: 38, s: 35, l: 90 },
      secondary:            { h: 38, s: 35, l: 90 },
      secondaryForeground:  { h: 30, s: 25, l: 18 },

      // Estados — armonizan con la paleta cálida
      destructive:          { h: 8,   s: 60, l: 48 },
      destructiveForeground:{ h: 38, s: 50, l: 98 },
      success:              { h: 80,  s: 35, l: 38 },
      successForeground:    { h: 38, s: 50, l: 98 },
      warning:              { h: 32,  s: 75, l: 48 },
      warningForeground:    { h: 30, s: 50, l: 14 },
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
    motivationalPhrases: [
      "El aprendizaje es un viaje, no un destino. ¡Seguí adelante!",
      "Cada día en el aula es un paso hacia tu futuro.",
      "La constancia es la clave del éxito. ¡Vos podés!",
      "Los grandes logros comienzan con pequeños esfuerzos diarios.",
      "Tu esfuerzo de hoy es tu orgullo de mañana.",
      "¡Hoy es un gran día para aprender algo nuevo!",
    ],
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
      // Solo pisan el brand: el resto hereda los warm neutrals
      primary: { h: 356, s: 60, l: 42 },
      ring:    { h: 356, s: 60, l: 42 },
      accent:  { h: 356, s: 50, l: 92 },
      accentForeground: { h: 356, s: 60, l: 28 },
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
