/** Canonical production domain — single source of truth for SEO URLs. */
export const SITE_URL = "https://etecestudio.com" as const;

export const SITE_NAME = "ETECÉ STUDIO" as const;

export const SITE_EMAIL = "contacto@etecestudio.com" as const;

export const DEFAULT_OG_IMAGE = "/og-image.png" as const;

export const DEFAULT_TITLE =
  "Agencia de Branding y Comunicación Visual | ETECÉ STUDIO" as const;

export const DEFAULT_DESCRIPTION =
  "Creamos marcas, identidades visuales y páginas web con criterio. Agencia de branding y comunicación visual para empresas en Madrid, Ciudad Real y toda España." as const;

export const SOCIAL_PROFILES = [
  "https://www.instagram.com/etece_studio/",
  "https://x.com/etecestudio",
  "https://www.linkedin.com/company/129174233/",
] as const;

export function absoluteUrl(path: string): string {
  if (path === "" || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
