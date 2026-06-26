import { SITE_URL } from "./site";

export type PublicSitemapRoute = {
  path:
    | ""
    | "/aviso-legal"
    | "/politica-cookies"
    | "/politica-privacidad"
    | "/portal-transparencia";
  changeFrequency: "monthly" | "yearly";
  priority: number;
};

/**
 * Audited public indexable routes for sitemap.ts and robots.ts.
 * Homepage anchors (#nosotros, #enfoque, #contacto) are sections, not routes.
 */
export const PUBLIC_SITEMAP_ROUTES: readonly PublicSitemapRoute[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/portal-transparencia", changeFrequency: "yearly", priority: 0.4 },
] as const;

export const ROBOTS_DISALLOW_PATHS = ["/admin", "/api"] as const;

export { SITE_URL };
