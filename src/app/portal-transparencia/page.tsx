import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo/metadata";
import styles from "@/components/legal/LegalPage.module.css";
import pageStyles from "./page.module.css";
import { contratosTransparencia } from "@/content/transparencia/contratos";

export const metadata: Metadata = createPageMetadata({
  title: "Portal de Transparencia | ETECÉ STUDIO",
  description:
    "Consulta pública de colaboraciones gratuitas, acuerdos y contratos publicados por ETECÉ STUDIO.",
  path: "/portal-transparencia",
});

export default function PortalTransparenciaPage() {
  const hasContratos = contratosTransparencia.length > 0;

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <header>
          <h1 className={styles.title}>Portal de Transparencia</h1>
          <span className={pageStyles.titleAccent} aria-hidden="true" />
          <p className={styles.subtitle}>etecestudio.com</p>
          <p className={styles.intro}>
            El Portal de Transparencia de ETECÉ STUDIO es el espacio destinado a hacer pública la información relativa a colaboraciones realizadas sin contraprestación económica directa, con el fin de ofrecer claridad sobre los compromisos asumidos por el estudio.
          </p>
        </header>

        <div className={styles.content}>
          <section
            className={`${styles.altSection} ${styles.altSectionLeft}`}
          >
            <h2 className={pageStyles.sectionTitle}>Introducción</h2>
            <p>
              Como estudio de diseño y comunicación visual, ETECÉ STUDIO mantiene en ocasiones colaboraciones con entidades, instituciones, proyectos sociales o iniciativas culturales en las que no media una compensación económica directa. La publicación de estas relaciones tiene por objetivo ofrecer una visibilidad clara y verificable de dichos compromisos.
            </p>
          </section>

          <section
            className={`${styles.altSection} ${styles.altSectionRight}`}
          >
            <h2 className={`${pageStyles.sectionTitle} ${pageStyles.sectionTitleRight}`}>
              Objetivo del portal
            </h2>
            <p>
              Este portal busca documentar de forma pública y trazable aquellas colaboraciones que se realicen al margen de un acuerdo comercial habitual. Su finalidad no es publicitaria, sino documental: permite a cualquier persona consultar, en un único espacio, los términos y la naturaleza de cada acuerdo no remunerado.
            </p>
          </section>

          <section
            className={`${styles.altSection} ${styles.altSectionLeft}`}
          >
            <h2 className={pageStyles.sectionTitle}>Criterios de publicación</h2>
            <p>
              Se publicará en este portal toda colaboración formalizada en la que no exista contraprestación económica directa por parte de la entidad colaboradora hacia ETECÉ STUDIO. Cada entrada incluirá la fecha, una descripción concisa de la colaboración, su tipología, el documento o referencia que la respalda y su estado actual.
            </p>
          </section>

          <section
            className={`${styles.altSection} ${styles.altSectionRight}`}
          >
            <h2 className={`${pageStyles.sectionTitle} ${pageStyles.sectionTitleRight}`}>
              Colaboraciones gratuitas
            </h2>
            <p>
              A continuación se relacionan las colaboraciones gratuitas vigentes y formalizadas. En caso de no existir registros, se hará constar expresamente.
            </p>
            <span className={pageStyles.tableTopAccent} aria-hidden="true" />
            <div className={styles.tableWrapper}>
              <table
                className={`${styles.table} ${pageStyles.transparencyTable}`}
              >
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Colaboración</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Documento</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {hasContratos ? (
                    contratosTransparencia.map((contrato, index) => (
                      <tr
                        key={`${contrato.fecha}-${contrato.colaboracion}-${index}`}
                      >
                        <td>{contrato.fecha}</td>
                        <td>{contrato.colaboracion}</td>
                        <td>{contrato.tipo}</td>
                        <td className={pageStyles.docCell}>
                          <a
                            href={contrato.documento}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={pageStyles.docLink}
                          >
                            Ver contrato
                          </a>
                        </td>
                        <td>{contrato.estado}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className={`${styles.tableEmpty} ${pageStyles.emptyCell}`}
                        colSpan={5}
                      >
                        No hay contratos de colaboración gratuita publicados actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={pageStyles.privacyNote}>
              Los documentos publicados en este portal podrán ser versiones preparadas para consulta pública, evitando la exposición de datos personales o información no necesaria.
            </p>
          </section>

          <section
            className={`${styles.altSection} ${styles.altSectionLeft}`}
          >
            <h2 className={pageStyles.sectionTitle}>Documentación pública</h2>
            <p>
              La documentación de cada colaboración incluida en el portal estará a disposición de cualquier persona interesada. Cuando un acuerdo contenga información sujeta a confidencialidad, se publicará la información esencial respetando las restricciones aplicables.
            </p>
          </section>
        </div>

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
