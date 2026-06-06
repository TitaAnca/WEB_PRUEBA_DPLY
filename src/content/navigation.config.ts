/** Locked navigation — section anchors (vertical label column). */
export const NAV_SECTION_LINKS = [
  { href: "#nosotros", dataNav: "nosotros", label: "Nosotros" },
  { href: "#enfoque", dataNav: "enfoque", label: "Enfoque" },
  { href: "#contacto", dataNav: "contacto", label: "Contacto" },
] as const;

/** Locked social icons — one asset per network; `src` swaps on red sections via nav.locked.ts */
export const NAV_SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/etece_studio/",
    label: "Instagram",
    srcDefault: "/assets/instagram.png",
    srcOnRed: "/assets/instagram_blanco.png",
    variant: "default" as const,
  },
  {
    href: "https://x.com/etecestudio",
    label: "X (Twitter)",
    srcDefault: "/assets/x-twitter.png",
    srcOnRed: "/assets/x-twitter-blanco.png",
    variant: "x" as const,
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    srcDefault: "/assets/Linkedin.png",
    srcOnRed: "/assets/Linkedin_blanco.png",
    variant: "default" as const,
  },
] as const;

export type NavTheme = "dark" | "red" | "light";

/**
 * Color de las labels de navegación + puntos animados (ellipsis) por tema
 * de sección. Cada sección del home declara su tema vía `data-theme` y la
 * lógica de contraste (nav.locked.ts) aplica estos colores:
 *   dark  → Enfoque  (fondo #000000) → labels blancas, puntos rojos
 *   red   → Nosotros (fondo #FAFAFF) → labels negras,  puntos rojos
 *   light → Contacto (fondo #FAFAFF) → labels negras,  puntos rojos
 * `label` = color de las labels; `dot` = color de los puntos animados.
 */
export const NAV_THEME_COLORS: Record<
  NavTheme,
  { label: string; dot: string }
> = {
  dark: { label: "#FFFFFF", dot: "#EC0000" },
  red: { label: "#000000", dot: "#EC0000" },
  light: { label: "#000000", dot: "#EC0000" },
};
