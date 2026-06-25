"use client";

import Link from "next/link";
import styles from "./HomeServicesIndex.module.css";

const SERVICE_LINKS = [
  { href: "/branding", label: "Branding" },
  { href: "/identidad-visual", label: "Identidad visual" },
  { href: "/rebranding", label: "Rebranding" },
  { href: "/diseno-web", label: "Diseño web" },
  { href: "/comunicacion-visual", label: "Comunicación visual" },
] as const;

export function HomeServicesIndex() {
  return (
    <nav className={styles.services} aria-label="Servicios de ETECÉ STUDIO">
      <p className={styles.label}>Servicios</p>
      <ul className={styles.list}>
        {SERVICE_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
