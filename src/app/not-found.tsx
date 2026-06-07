import type { Metadata } from "next";
import Image from "next/image";
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
        <Image
          src="/assets/Símbolo_EtecéStudio_Rojo_404.png"
          alt="Error 404 de Etecé Studio"
          width={600}
          height={600}
          priority
          unoptimized
          className={styles.notFoundImage}
        />
        <div className={styles.notFoundText}>
          <h1>404</h1>
          <p>
            Esta página no existe, pero el{" "}
            <span className={styles.brandRed}>etecé</span> continúa.
          </p>
          <Link href="/">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}
