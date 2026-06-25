import Link from "next/link";
import type { SeoInternalPageData } from "@/content/seo/types";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  serviceJsonLd,
} from "@/lib/seo/structuredData";
import { absoluteUrl } from "@/lib/seo/site";
import styles from "./SeoInternalPage.module.css";

type SeoInternalPageProps = {
  page: SeoInternalPageData;
};

export function SeoInternalPage({ page }: SeoInternalPageProps) {
  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: page.breadcrumbLabel, path: page.path },
  ];

  const structuredData = [
    breadcrumbJsonLd(breadcrumbs),
    ...(page.serviceType
      ? [
          serviceJsonLd({
            name: page.breadcrumbLabel,
            description: page.metadataDescription,
            url: absoluteUrl(page.path),
            serviceType: page.serviceType,
          }),
        ]
      : []),
  ];

  return (
    <main className={styles.seoPage}>
      <JsonLd data={structuredData} />
      <article className={styles.article}>
        <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span className={styles.sep} aria-hidden="true">
            /
          </span>
          <span aria-current="page">{page.breadcrumbLabel}</span>
        </nav>

        <header className={styles.hero}>
          <p className={styles.kicker}>ETECÉ STUDIO</p>
          <h1 className={styles.h1}>{page.h1}</h1>
          <p className={styles.lead}>{page.lead}</p>
        </header>

        <div className={styles.content}>
          {page.sections.map((section) => (
            <section
              key={section.title ?? section.paragraphs[0]?.slice(0, 40)}
              className={styles.section}
            >
              {section.title ? (
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              ) : null}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul className={styles.list}>
                  {section.list.map((item) => (
                    <li key={item.slice(0, 48)}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {page.processSteps && page.processSteps.length > 0 ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {page.processTitle ?? "Cómo trabajamos"}
              </h2>
              <ol className={styles.processList}>
                {page.processSteps.map((step) => (
                  <li key={step.slice(0, 48)}>{step}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {page.deliverables && page.deliverables.length > 0 ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {page.deliverablesTitle ?? "Entregables habituales"}
              </h2>
              <ul className={styles.list}>
                {page.deliverables.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {page.audience && page.audience.length > 0 ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {page.audienceTitle ?? "Para quién es"}
              </h2>
              <ul className={styles.list}>
                {page.audience.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {page.faqs.length > 0 ? (
            <section className={styles.faq} aria-labelledby="faq-heading">
              <h2 id="faq-heading" className={styles.sectionTitle}>
                Preguntas frecuentes
              </h2>
              {page.faqs.map((faq) => (
                <div key={faq.question} className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>{faq.question}</h3>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              ))}
            </section>
          ) : null}

          {page.relatedLinks.length > 0 ? (
            <nav className={styles.related} aria-label="Servicios relacionados">
              <p className={styles.relatedTitle}>Servicios relacionados</p>
              <ul className={styles.relatedList}>
                {page.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Hablemos de tu marca</h2>
            <p className={styles.ctaText}>
              Cuéntanos qué necesita tu empresa. Ordenamos lo importante y
              construimos una identidad con criterio.
            </p>
            <Link href="/#contacto" className={styles.ctaLink}>
              Ir a contacto
            </Link>
          </div>
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
