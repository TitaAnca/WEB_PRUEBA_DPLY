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

          const kicker = q(`.${styles.kicker}`);
          if (kicker.length) {
            gsap.from(kicker, {
              opacity: 0,
              y: 18,
              duration: 0.6,
              ease,
              scrollTrigger: { trigger: root, start: "top 80%" },
            });
          }

          const titleLines = q(`.${styles.titleLine}`);
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

          const intro = q(`.${styles.intro}`);
          if (intro.length) {
            gsap.from(intro, {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease,
              scrollTrigger: { trigger: intro[0], start: "top 88%" },
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
                  trigger: q(`.${styles.photo}`)[0] ?? root,
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
                trigger: q(`.${styles.method}`)[0] ?? root,
                start: "top 85%",
              },
            });
          }

          const closingLines = q(`.${styles.closingLine}`);
          if (closingLines.length) {
            gsap.from(closingLines, {
              y: 30,
              opacity: 0,
              duration: 0.8,
              ease,
              stagger: 0.1,
              scrollTrigger: {
                trigger: q(`.${styles.closing}`)[0] ?? root,
                start: "top 88%",
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
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgStripe} />
        <div className={styles.bgWash} />
        <div className={styles.bgGrain} />
      </div>

      <div className={styles.inner}>
        <div className={styles.topEditorial}>
          {/* h2 con display:contents → mantiene la semántica de un único
              encabezado, pero sus partes se colocan en celdas del grid:
              línea 1 arriba · bloque línea 2 a la izquierda de la imagen. */}
          <h2 className={styles.title}>
            <span className={styles.line1}>
              <span className={styles.titleLine}>DONDE OTROS VEN RUIDO,</span>
            </span>
            <span className={styles.line2}>
              <span className={styles.titleLine}>NOSOTROS</span>
              <span className={styles.titleLine}>VEMOS SISTEMA.</span>
            </span>
          </h2>

          <p className={styles.intro}>
            No partimos de piezas sueltas, sino de un sistema capaz de unir lo
            que la marca dice, muestra y provoca. Ordenamos el ruido, definimos
            el criterio y convertimos cada decisión visual en una forma
            reconocible de estar en el mundo.
          </p>

          <div className={styles.photoWrap}>
            <figure className={styles.photo}>
              <div className={styles.photoMedia}>
                <img
                  src={ENFOQUE_PHOTO_SRC}
                  alt="Proceso creativo de Etecé Studio con materiales de identidad visual sobre una mesa de trabajo"
                  className={styles.photoImg}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </figure>
          </div>
        </div>

        <div className={styles.method}>
          {METHOD_CARDS.map((card) => (
            <article key={card.number} className={styles.card}>
              <span className={styles.cardNumber}>{card.number}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardText}>{card.text}</p>
              <span className={styles.cardLine} aria-hidden="true" />
            </article>
          ))}
        </div>

        <footer className={styles.closing}>
          <p className={styles.closingLine}>No añadimos más ruido.</p>
          <p className={styles.closingLine}>
            Hacemos que todo hable el mismo idioma.
          </p>
          <div className={styles.closingDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </footer>
      </div>
    </section>
  );
}
