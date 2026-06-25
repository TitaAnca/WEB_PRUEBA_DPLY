import Link from "next/link";

import { NAV_SOCIAL_LINKS } from "@/content/navigation.config";

const SERVICE_LINKS = [
  { href: "/branding", label: "Branding" },
  { href: "/identidad-visual", label: "Identidad visual" },
  { href: "/rebranding", label: "Rebranding" },
  { href: "/diseno-web", label: "Diseño web" },
  { href: "/comunicacion-visual", label: "Comunicación visual" },
] as const;

/** Inline brand glyphs so the footer socials render crisp red via currentColor. */
function SocialGlyph({ label }: { label: string }) {
  if (label.toLowerCase().includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.12-1.38 5.86 5.86 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.12A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z" />
        <path d="M12 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8z" />
        <circle cx="18.41" cy="5.59" r="1.44" />
      </svg>
    );
  }

  if (label.toLowerCase().includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    );
  }

  // X (Twitter)
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <p>© Etecé Studio</p>
        <p>Branding & Comunicación Visual</p>
      </div>
      <div className="site-footer__solutions-zone">
        <a
          href="https://etecesolutions.com"
          className="site-footer__solutions"
          target="_blank"
          rel="noopener noreferrer"
        >
          Etecé Solutions
        </a>
      </div>
      <nav className="site-footer__services" aria-label="Servicios">
        {SERVICE_LINKS.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="site-footer__services-link"
          >
            {service.label}
          </Link>
        ))}
      </nav>
      {/* Mobile only: redes sociales pequeñas y rojas, entre Etecé Solutions y
          los enlaces legales. Ocultas en desktop/tablet (ver globals.css). */}
      <div className="site-footer__socials" aria-label="Redes sociales">
        {NAV_SOCIAL_LINKS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
          >
            <SocialGlyph label={social.label} />
          </a>
        ))}
      </div>
      <nav className="site-footer__legal" aria-label="Información legal">
        <Link href="/aviso-legal" className="site-footer__legal-link">
          Aviso legal
        </Link>
        <Link href="/politica-cookies" className="site-footer__legal-link">
          Política de cookies
        </Link>
        <Link href="/politica-privacidad" className="site-footer__legal-link">
          Política de privacidad
        </Link>
        <Link
          href="/portal-transparencia"
          className="site-footer__legal-link site-footer__legal-link--portal"
        >
          Portal de Transparencia
        </Link>
      </nav>
    </footer>
  );
}
