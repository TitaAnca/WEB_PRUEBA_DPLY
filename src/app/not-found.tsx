import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada | ETECÉ STUDIO",
  description: "La página solicitada no existe.",
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
        <Link href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
