import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalPage.module.css";

interface LegalPageProps {
  title: string;
  intro: string;
  children: ReactNode;
}

/**
 * Shared institutional layout for the four legal/transparency pages.
 * Renders: H1 → provisional notice → intro paragraph → sections → footnote.
 * No GSAP, no animation. Scoped via CSS module.
 */
export function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.notice}>
          Este contenido es provisional y deberá ser revisado antes de su publicación definitiva.
        </p>
        <p className={styles.intro}>{intro}</p>
        <div className={styles.content}>{children}</div>
        <footer className={styles.footnote}>
          <p>© ETECÉ STUDIO</p>
          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
        </footer>
      </article>
    </main>
  );
}
