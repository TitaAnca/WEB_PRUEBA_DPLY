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
      </section>
    </main>
  );
}
