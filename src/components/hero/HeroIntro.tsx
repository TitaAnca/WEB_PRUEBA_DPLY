"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import styles from "./HeroIntro.module.css";

/* ============================================================
   ETECÉ · Hero intro
   Los tres puntos son el origen del sistema. Aparecen desde el
   negro, escalan, se multiplican en una matriz modular, fluyen
   con ritmo editorial, forman la palabra SISTEMA, se rompen, se
   reensamblan en los tres puntos originales, hacen un empuje
   final con acento rojo y revelan el hero.
   Negro #000 · blanco #fff · rojo #ec0000. ~6.6s.
   ============================================================ */

// Tipografía de puntos 5×7 para componer la palabra.
const FONT: Record<string, string[]> = {
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
};

const WORD = "SISTEMA";
const GLYPH_W = 5;
const ROWS = 7;
const COLS = WORD.length * GLYPH_W + (WORD.length - 1); // gap de 1 col entre letras

function buildWordFlags() {
  const rowStrings: string[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    rowStrings.push(WORD.split("").map((ch) => FONT[ch][r]).join("0"));
  }
  const on: boolean[] = [];
  const red: boolean[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const isOn = rowStrings[r][c] === "1";
      on.push(isOn);
      // acentos rojos muy escasos
      red.push(isOn && r % 3 === 0 && c % 5 === 0);
    }
  }
  return { on, red };
}

/**
 * Hero intro animado a partir de los tres puntos Etecé.
 * Overlay negro opaco sobre el hero que se desvanece al terminar.
 */
export const HeroIntro = forwardRef<HTMLDivElement>(function HeroIntro(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const threeDotsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInnerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

  const { on: onFlags, red: redFlags } = useMemo(buildWordFlags, []);

  useGSAP(
    () => {
      const root = containerRef.current;
      const threeEl = threeDotsRef.current;
      const gridInnerEl = gridInnerRef.current;
      const flashEl = flashRef.current;
      const trailEl = trailRef.current;
      if (!root || !threeEl || !gridInnerEl) return;

      const three = Array.from(threeEl.children) as HTMLElement[];
      const cells = Array.from(gridInnerEl.children) as HTMLElement[];
      if (three.length !== 3 || cells.length !== onFlags.length) return;

      const onDots = cells.filter((_, i) => onFlags[i]);
      const offDots = cells.filter((_, i) => !onFlags[i]);
      const redDots = cells.filter((_, i) => redFlags[i]);

      const body = document.body;
      const setIntro = (state: "running" | "done") => {
        body.dataset.heroIntro = state;
      };

      // Ocultar nav/logo desde ya (siguen ocultos por el preloader).
      setIntro("running");

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Escala para encajar la matriz/palabra en el viewport.
      const fitGrid = () => {
        if (!gridRef.current) return 1;
        gsap.set(gridInnerEl, { scale: 1 });
        const rect = gridInnerEl.getBoundingClientRect();
        const sx = (window.innerWidth * 0.9) / rect.width;
        const sy = (window.innerHeight * 0.42) / rect.height;
        return Math.min(1, sx, sy);
      };

      let cancelled = false;

      // ── Estado inicial ──────────────────────────────────────
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(three, { scale: 0, opacity: 0, backgroundColor: "#ffffff" });
      gsap.set(threeEl, { xPercent: 0, scale: 1 });
      gsap.set(cells, { scale: 0, opacity: 0, x: 0, y: 0, backgroundColor: "#ffffff" });
      if (flashEl) gsap.set(flashEl, { opacity: 0 });
      if (trailEl) gsap.set(trailEl, { scaleX: 0, opacity: 0 });

      const finish = () => {
        setIntro("done");
        gsap.set(root, { pointerEvents: "none" });
      };

      // ── Reduced motion: revelado corto ──────────────────────
      if (reduceMotion) {
        const tlReduced = gsap.timeline({ paused: true, onComplete: finish });
        tlReduced.to(three, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
        });
        tlReduced.to(root, { autoAlpha: 0, duration: 0.45, ease: "power1.inOut" }, "+=0.25");
        void waitForSiteReveal().then(() => {
          if (!cancelled) tlReduced.play();
        });
        return () => {
          cancelled = true;
          setIntro("done");
        };
      }

      const fitScale = fitGrid();
      gsap.set(gridInnerEl, { scale: fitScale });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: finish,
      });

      // P1 · respiración en negro
      tl.to({}, { duration: 0.4 });

      // P2 · aparecen los tres puntos (origen del sistema)
      tl.to(three, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
      });

      // P3 · presencia: escalan enormes + micro destello rojo
      tl.to(three, {
        scale: 7,
        duration: 0.8,
        ease: "power4.inOut",
      }, "+=0.12");
      if (flashEl) {
        tl.to(flashEl, {
          opacity: 0.16,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        }, "<0.18");
      }

      // P4 · multiplicación en matriz modular (los grandes se retiran)
      tl.addLabel("multiply");
      tl.to(three, { scale: 0, opacity: 0, duration: 0.45 }, "multiply");
      tl.to(cells, {
        scale: 1,
        opacity: 0.92,
        duration: 0.5,
        stagger: { amount: 0.45, from: "center", grid: [ROWS, COLS] },
      }, "multiply");

      // P5 · campo cinético: deriva horizontal con ritmo
      tl.to(gridInnerEl, {
        x: "+=34",
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      }, "-=0.1");

      // P6 · forman la palabra SISTEMA
      tl.addLabel("word");
      tl.to(offDots, { opacity: 0.06, scale: 0.5, duration: 0.6 }, "word");
      tl.to(onDots, { opacity: 1, scale: 1.18, duration: 0.6 }, "word");
      if (redDots.length) {
        tl.to(redDots, { backgroundColor: "#ec0000", duration: 0.4 }, "word+=0.2");
      }
      tl.to({}, { duration: 0.45 }); // hold legible

      // P7 · ruptura controlada (no caos)
      tl.addLabel("break");
      tl.to(cells, {
        x: () => gsap.utils.random(-340, 340),
        y: () => gsap.utils.random(-220, 220),
        opacity: 0,
        scale: 0.3,
        duration: 0.7,
        ease: "power2.in",
        stagger: { amount: 0.25, from: "edges" },
      }, "break");
      tl.set(redDots, { backgroundColor: "#ffffff" }, "break");

      // P8 · regreso a los tres puntos
      tl.addLabel("reassemble", "break+=0.5");
      tl.set(three, { x: 0, y: 0, scale: 0, opacity: 0, backgroundColor: "#ffffff" }, "reassemble");
      tl.to(three, {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
      }, "reassemble");
      // un punto parpadea en rojo como firma
      tl.to(three[1], {
        backgroundColor: "#ec0000",
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      }, "reassemble+=0.2");

      // P9 · empuje final con estela roja
      tl.addLabel("push");
      if (trailEl) {
        tl.to(trailEl, {
          scaleX: 1,
          opacity: 0.9,
          duration: 0.45,
          ease: "power3.out",
        }, "push");
      }
      tl.to(threeEl, {
        xPercent: 10,
        duration: 0.5,
        ease: "power4.in",
      }, "push");

      // P10 · revelado del hero
      tl.addLabel("reveal", "push+=0.2");
      tl.call(() => setIntro("done"), undefined, "reveal");
      tl.to(root, {
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.inOut",
      }, "reveal");

      void waitForSiteReveal().then(() => {
        if (!cancelled) tl.play();
      });

      return () => {
        cancelled = true;
        setIntro("done");
      };
    },
    { scope: containerRef, dependencies: [onFlags, redFlags] }
  );

  return (
    <div ref={containerRef} className={styles.root} aria-hidden="true">
      <span ref={flashRef} className={styles.flash} />
      <div className={styles.stage}>
        <span ref={trailRef} className={styles.trail} />
        <div ref={threeDotsRef} className={styles.threeDots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div ref={gridRef} className={styles.grid}>
          <div
            ref={gridInnerRef}
            className={styles.gridInner}
            style={{
              gridTemplateColumns: `repeat(${COLS}, var(--ec-cell))`,
              gridTemplateRows: `repeat(${ROWS}, var(--ec-cell))`,
            }}
          >
            {onFlags.map((_, i) => (
              <span key={i} className={styles.cell} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
