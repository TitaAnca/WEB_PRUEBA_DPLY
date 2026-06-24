/**
 * Canonical production domain and audited public indexable routes.
 * Source of truth for sitemap.ts and robots.ts.
 *
 * Audited App Router pages (src/app/.../page.tsx):
 * - /                          → src/app/page.tsx
 * - /aviso-legal               → src/app/aviso-legal/page.tsx
 * - /politica-cookies          → src/app/politica-cookies/page.tsx
 * - /politica-privacidad       → src/app/politica-privacidad/page.tsx
 * - /portal-transparencia      → src/app/portal-transparencia/page.tsx
 *
 * Excluded from sitemap:
 * - /admin/contactos           → noindex + robots disallow
 * - /api/contact               → API handler, not a page
 * - Homepage anchors (#nosotros, #enfoque, #contacto) → sections, not routes
 */
export const SITE_URL = "https://etecestudio.com" as const;

export type PublicSitemapRoute = {
  path: "" | "/aviso-legal" | "/politica-cookies" | "/politica-privacidad" | "/portal-transparencia";
  changeFrequency: "monthly" | "yearly";
  priority: number;
};

export const PUBLIC_SITEMAP_ROUTES: readonly PublicSitemapRoute[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/portal-transparencia", changeFrequency: "yearly", priority: 0.4 },
] as const;

/** Paths blocked in robots.txt (not indexable). */
export const ROBOTS_DISALLOW_PATHS = ["/admin", "/api"] as const;
