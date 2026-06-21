"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./EnfoqueSection.module.css";

const METHOD_CARDS = [
  {
    number: "01",
    title: "/ Escuchar lo que no se ve",
    text: "Antes de diseñar, leemos el contexto: lo que la marca dice, lo que calla y lo que necesita ordenar para ser entendida.",
  },
  {
    number: "02",
    title: "/ Quitar ruido",
    text: "No todo lo que existe suma. Detectamos incoherencias, limpiamos excesos y dejamos solo lo que ayuda a construir una identidad más clara.",
  },
  {
    number: "03",
    title: "/ Darle forma al criterio",
    text: "Convertimos la dirección en lenguaje visual: composición, color, tipografía, recursos gráficos, tono y sistema.",
  },
  {
    number: "04",
    title: "/ Sacarlo al mundo",
    text: "La llevamos a web, redes, campañas, piezas comerciales y puntos de contacto reales, para que funcione donde de verdad importa.",
  },
] as const;

const ENFOQUE_PHOTO_SRC = "/assets/Enfoque_EtecéStudio.png";

export function EnfoqueSection() {
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

          const titleLines = q(`.${styles.enfoqueTitleLine}`);
          if (titleLines.length) {
            gsap.from(titleLines, {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease,
              stagger: 0.1,
              scrollTrigger: { trigger: root, start: "top 78%" },
            });
          }

          const paragraph = q(`.${styles.enfoqueParagraph}`);
          if (paragraph.length) {
            gsap.from(paragraph, {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease,
              scrollTrigger: { trigger: paragraph[0], start: "top 88%" },
            });
          }

          const photo = q(`.${styles.photoMedia}`);
          if (photo.length) {
            gsap.fromTo(
              photo,
              { clipPath: "inset(0 100% 0 0)", scale: 1.06 },
              {
                clipPath: "inset(0 0% 0 0)",
                scale: 1,
                duration: 1.15,
                ease,
                scrollTrigger: {
                  trigger: q(`.${styles.enfoqueImageWrapper}`)[0] ?? root,
                  start: "top 82%",
                },
              },
            );
          }

          const cards = q(`.${styles.card}`);
          if (cards.length) {
            gsap.from(cards, {
              y: 34,
              opacity: 0,
              duration: 0.85,
              ease,
              stagger: 0.16,
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: q(`.${styles.enfoqueCardsGrid}`)[0] ?? root,
                start: "top 85%",
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
      id="enfoque"
      data-theme="dark"
      className={`landing-block landing-block--enfoque ${styles.enfoque}`}
      aria-label="Enfoque"
    >
      <div className={`${styles.bg} postHeroSafeFrame`} aria-hidden="true">
        <div className={styles.bgStripe} />
        <div className={styles.bgWash} />
        <div className={styles.bgGrain} />
      </div>

      <div className={`${styles.inner} postHeroSafeFrame`}>
        <div className={styles.enfoqueHeader}>
          <h2 className={styles.enfoqueTitleTop}>
            <span className={styles.enfoqueTitleLine}>
              DONDE OTROS VEN{" "}
              <span className={styles.enfoqueAccent}>RUIDO</span>,
            </span>
          </h2>

          <div className={styles.enfoqueLowerLeft}>
            <div className={styles.enfoqueTitleBottom}>
              <span className={styles.enfoqueTitleLine}>
                <span className={styles.enfoqueTitleLowerLead}>
                  NOSOTROS
                  <br className={styles.enfoqueTitleBrDesktop} aria-hidden="true" />
                  {" "}
                  VEMOS
                </span>
                {" "}
                <span className={styles.enfoqueAccent}>SISTEMA</span>.
              </span>
            </div>

            <p className={styles.enfoqueParagraph}>
              No partimos de piezas sueltas, sino de un sistema capaz de unir lo
              que la marca dice, muestra y provoca. Ordenamos el ruido, definimos
              el criterio y convertimos cada decisión visual en una forma
              reconocible de estar en el mundo.
            </p>
          </div>

          <div className={styles.enfoqueImageWrapper}>
            <div className={styles.photoMedia}>
              <img
                src={ENFOQUE_PHOTO_SRC}
                alt="Proceso creativo de Etecé Studio con materiales de identidad visual sobre una mesa de trabajo"
                className={styles.photoImg}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className={styles.enfoqueCardsGrid}>
          {METHOD_CARDS.map((card) => (
            <article key={card.number} className={styles.card}>
              <span className={styles.cardNumber}>{card.number}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardText}>{card.text}</p>
              <span className={styles.cardLine} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
