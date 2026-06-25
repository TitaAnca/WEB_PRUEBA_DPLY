import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Página no encontrada | ETECÉ STUDIO",
  },
  description: "La página solicitada no existe.",
  robots: {
    index: false,
    follow: true,
  },
};

const SERVICE_LINKS = [
  { href: "/branding", label: "Branding" },
  { href: "/identidad-visual", label: "Identidad visual" },
  { href: "/diseno-web", label: "Diseño web" },
] as const;

export default function NotFound() {
  return (
    <main className={styles.notFoundPage}>
      <section className={styles.notFoundCard}>
        <h1>404</h1>
        <p>
          Esta página no existe, pero el{" "}
          <span className={styles.brandRed}>etecé</span> continúa.
        </p>
        <div className={styles.links}>
          <Link href="/">Volver al inicio</Link>
          <Link href="/#contacto">Contacto</Link>
        </div>
        <nav className={styles.services} aria-label="Servicios">
          {SERVICE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
