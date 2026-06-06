import { NAV_SECTION_LINKS, NAV_SOCIAL_LINKS } from "@/content/navigation.config";

/**
 * Locked text navigation + social icons.
 * Contrast, icon src swap, label ellipsis, and icon redraw: nav.locked.ts
 */
export function NavigationLocked() {
  return (
    <header className="text-nav" aria-label="Navegación de secciones">
      <nav aria-label="Redes sociales y secciones">
        <div className="nav-social-row" aria-label="Redes sociales">
          {NAV_SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              className="nav-social-link"
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
            >
              {social.variant === "x" ? (
                <span className="nav-social-icon-slot nav-social-icon-slot--x">
                  <span className="nav-social-icon-stack" aria-hidden="true">
                    <img
                      className="nav-social-icon nav-social-icon--png nav-social-icon--x-weight"
                      src={social.srcDefault}
                      data-src-default={social.srcDefault}
                      data-src-on-red={social.srcOnRed}
                      alt=""
                      width={22}
                      height={22}
                      draggable={false}
                    />
                  </span>
                </span>
              ) : (
                <span className="nav-social-icon-stack" aria-hidden="true">
                  <img
                    className="nav-social-icon nav-social-icon--png"
                    src={social.srcDefault}
                    data-src-default={social.srcDefault}
                    data-src-on-red={social.srcOnRed}
                    alt=""
                    width={22}
                    height={22}
                    draggable={false}
                  />
                </span>
              )}
            </a>
          ))}
        </div>

        <div className="nav-label-row">
          {NAV_SECTION_LINKS.map((link) => (
            <a key={link.href} href={link.href} data-nav={link.dataNav}>
              <span className="nav-label-word">{link.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
