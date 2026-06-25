import { SITE_URL } from "./site";

export type PublicSitemapRoute = {
  path:
    | ""
    | "/branding"
    | "/identidad-visual"
    | "/rebranding"
    | "/diseno-web"
    | "/comunicacion-visual"
    | "/agencia-branding-madrid"
    | "/agencia-branding-ciudad-real"
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
  { path: "/branding", changeFrequency: "monthly", priority: 0.9 },
  { path: "/identidad-visual", changeFrequency: "monthly", priority: 0.9 },
  { path: "/rebranding", changeFrequency: "monthly", priority: 0.85 },
  { path: "/diseno-web", changeFrequency: "monthly", priority: 0.85 },
  { path: "/comunicacion-visual", changeFrequency: "monthly", priority: 0.85 },
  { path: "/agencia-branding-madrid", changeFrequency: "monthly", priority: 0.75 },
  {
    path: "/agencia-branding-ciudad-real",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/portal-transparencia", changeFrequency: "yearly", priority: 0.4 },
] as const;

export const ROBOTS_DISALLOW_PATHS = ["/admin", "/api"] as const;

export { SITE_URL };
