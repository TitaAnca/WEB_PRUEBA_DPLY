"use client";

import { HomeServicesIndex } from "@/components/seo/HomeServicesIndex";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./NosotrosSection.module.css";

export function NosotrosSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add(
        { motionOK: "(prefers-reduced-motion: no-preference)" },
        (context) => {
          if (!context.conditions?.motionOK) return;

          const q = gsap.utils.selector(root);
          const ease = "power3.out";

          const visual = q(`.${styles.visualFrame}`);
          if (visual.length) {
            gsap.from(visual, {
              y: 34,
              opacity: 0,
              duration: 1,
              ease,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: root, start: "top 82%" },
            });
          }

          const titleLines = q(`.${styles.titleLine}`);
          if (titleLines.length) {
            gsap.from(titleLines, {
              yPercent: 110,
              opacity: 0,
              duration: 0.85,
              ease,
              stagger: 0.08,
              scrollTrigger: { trigger: root, start: "top 80%" },
            });
          }

          const copy = q(`.${styles.copy}`);
          if (copy.length) {
            gsap.from(copy, {
              y: 22,
              opacity: 0,
              duration: 0.7,
              ease,
              scrollTrigger: { trigger: copy[0], start: "top 90%" },
            });
          }

          const closingLines = q(`.${styles.closingLine}`);
          if (closingLines.length) {
            gsap.from(closingLines, {
              y: 34,
              opacity: 0,
              duration: 0.85,
              ease,
              stagger: 0.12,
              scrollTrigger: {
                trigger: q(`.${styles.closing}`)[0],
                start: "top 90%",
              },
            });
          }

          const dots = q(`.${styles.dots} span`);
          if (dots.length) {
            gsap.from(dots, {
              scale: 0,
              opacity: 0,
              duration: 0.5,
              ease,
              stagger: 0.12,
              scrollTrigger: {
                trigger: q(`.${styles.dots}`)[0],
                start: "top 96%",
              },
            });
          }
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      data-theme="red"
      className={`landing-block landing-block--nosotros ${styles.section}`}
      aria-label="Nosotros"
    >
      {/* Hoja editorial diseñada: zona superior clara + zona inferior negra
          dominante con gráfico de contorno blanco derivado de la identidad. */}
      <div className={`${styles.sheet} postHeroSafeFrame`}>
        {/* ─── ZONA SUPERIOR CLARA ─────────────────────────────── */}
        <div className={styles.sheetTop}>
          {/* Atmósfera editorial sutil: profundidad de papel + líneas finas de
              alineación + micro-acentos rojos en el espacio negativo. Sin objeto
              ni caja: estructura invisible detrás del contenido legible. */}
          <div className={styles.editorialLayer} aria-hidden="true">
            <span className={styles.editorialLineOne} />
            <span className={styles.editorialLineTwo} />
            <span className={styles.editorialLineFlow} />
            <span className={styles.redMarkImage} />
            <span className={styles.redMarkParagraph} />
          </div>

          <p className={styles.meta}>ETECÉ STUDIO</p>

          <h1 className={styles.seoH1}>Agencia de branding y comunicación visual</h1>

          <div className={styles.grid}>
            <div className={styles.visual}>
              <div className={styles.visualFrame}>
                <img
                  src="/assets/Studio.png"
                  alt=""
                  className={styles.visualImg}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className={styles.editorial}>
              <h2 className={styles.title}>
                <span className={styles.titleLine}>
                  <span className={styles.titleRed}>ETECÉ</span> ES LA FILOSOFÍA
                </span>
                <span className={styles.titleLine}>DE HACER QUE</span>
                <span className={styles.titleLine}>TODO LO DEMÁS IMPORTE.</span>
              </h2>

              {/* Regla editorial breve: ancla el título con el párrafo (micro
                  decisión roja, sin concepto de hilo). */}
              <span className={styles.titleRule} aria-hidden="true" />

              <div className={styles.copy}>
                <p className={styles.copyText}>
                  El &ldquo;etcétera&rdquo; no es lo que queda al final. Es todo
                  lo que hace que una marca tenga sentido cuando sale al mundo: la
                  forma en la que habla, se ordena, se reconoce y consigue que
                  cada detalle parezca parte de la misma idea.
                </p>
                <p className={styles.seoSupport}>
                  Desarrollamos estrategia de marca, identidad visual, rebranding,
                  diseño web y comunicación visual para empresas en Madrid, Ciudad
                  Real y toda España.
                </p>
                <HomeServicesIndex />
              </div>
            </div>
          </div>
        </div>

        {/* ─── ZONA INFERIOR NEGRA DOMINANTE ───────────────────── */}
        <div className={styles.sheetBottom}>
          <div className={styles.closing}>
            <p className={styles.closingFirst}>
              <span className={styles.closingLine}>Lo importante</span>
              <span className={styles.closingLine}>es lo que tú haces.</span>
            </p>

            <p className={styles.closingSecond}>
              <span className={styles.closingLine}>
                El <strong className={styles.red}>etecé</strong>
              </span>
              <span className={styles.closingLine}>es cosa nuestra.</span>
            </p>

            <div className={styles.dots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
