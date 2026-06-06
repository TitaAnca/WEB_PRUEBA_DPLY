import { NAV_SECTION_LINKS } from "@/content/navigation.config";

import styles from "./MobileNav.module.css";

/**
 * Mobile-only navigation: a discreet fixed black bar pinned at the TOP that
 * holds the logo (left) and the section labels (right) — no dropdown, no
 * center overlay. The active label follows the current section via the body
 * `section-*` classes set by nav.locked.ts. Desktop/tablet navigation is
 * untouched; this bar is hidden above the mobile breakpoint via CSS, and the
 * global top-left logo (.site-brand) is hidden on mobile so it never doubles.
 */
export function MobileNav() {
  return (
    <header className={styles.mobileTopNav}>
      <a className={styles.mobileTopNavLogo} href="#inicio" aria-label="Etecé Studio">
        <img src="/assets/_LOGO_BlancoRojo.svg" alt="Etecé Studio" draggable={false} />
      </a>

      <nav className={styles.mobileTopNavLinks} aria-label="Secciones">
        {NAV_SECTION_LINKS.map((link) => (
          <a key={link.href} href={link.href} data-section={link.dataNav}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
