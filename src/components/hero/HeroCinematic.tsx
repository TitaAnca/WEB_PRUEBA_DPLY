"use client";

import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HeroCinematic.module.css";

/* ============================================================
   ETECÉ · Hero cinemático editorial (fondo negro)
   "Antes de la imagen, el sistema." Intro tipográfica kinética
   (tres puntos rojos → fragmentos → sistema → lockup Etecé Studio)
   → secuencia de capturas (Block01–06) → tarjetas-divisor editoriales
   entre bloques → ticker rojo permanente abajo.

   SEGURIDAD:
   - Timeline 100% local (gsap.context con scope en el hero).
   - No oculta la web: nav/logo siempre visibles (heroIntro="done").
   - No toca body/html overflow, ni overlays fijos fuera del hero.
   - El ticker se mueve con CSS, independiente del timeline.
   - La secuencia de imágenes NO se toca: solo intro y divisores.
   ============================================================ */

type HeroBlock = {
  id: string;
  /** Set completo (referencia/uso futuro). */
  images: string[];
  /** Subconjunto que se anima ahora. */
  selected: string[];
  /** Clave de la frase de transición tras el bloque. */
  transition: TransitionKey;
};

type TransitionKey = "t1" | "t2" | "t3" | "t4" | "t5" | "final";

const HERO_BLOCKS: HeroBlock[] = [
  {
    id: "block-01",
    images: [
      "/assets/Block01/hero00.jfif",
      "/assets/Block01/hero01.png",
      "/assets/Block01/hero02.png",
      "/assets/Block01/hero03.png",
      "/assets/Block01/hero04.png",
      "/assets/Block01/hero05.png",
      "/assets/Block01/hero06.png",
      "/assets/Block01/hero07.png",
    ],
    selected: [
      "/assets/Block01/hero00.jfif",
      "/assets/Block01/hero03.png",
      "/assets/Block01/hero06.png",
    ],
    transition: "t1",
  },
  {
    id: "block-02",
    images: [
      "/assets/Block02/hero08.png",
      "/assets/Block02/hero09.png",
      "/assets/Block02/hero10.png",
      "/assets/Block02/hero11.png",
      "/assets/Block02/hero12.png",
      "/assets/Block02/hero13.png",
      "/assets/Block02/hero14.jfif",
      "/assets/Block02/hero15.png",
    ],
    selected: [
      "/assets/Block02/hero08.png",
      "/assets/Block02/hero11.png",
      "/assets/Block02/hero14.jfif",
    ],
    transition: "t2",
  },
  {
    id: "block-03",
    images: [
      "/assets/Block03/hero16.png",
      "/assets/Block03/hero17.png",
      "/assets/Block03/hero18.jfif",
      "/assets/Block03/hero19.png",
      "/assets/Block03/hero20.png",
      "/assets/Block03/hero21.png",
      "/assets/Block03/hero22.png",
      "/assets/Block03/hero23.png",
    ],
    selected: [
      "/assets/Block03/hero16.png",
      "/assets/Block03/hero19.png",
      "/assets/Block03/hero22.png",
    ],
    transition: "t3",
  },
  {
    id: "block-04",
    images: [
      "/assets/Block04/hero24.png",
      "/assets/Block04/hero25.png",
      "/assets/Block04/hero26.png",
      "/assets/Block04/hero27.png",
      "/assets/Block04/hero28.png",
      "/assets/Block04/hero29.png",
      "/assets/Block04/hero30.png",
      "/assets/Block04/hero31.png",
    ],
    selected: [
      "/assets/Block04/hero24.png",
      "/assets/Block04/hero27.png",
      "/assets/Block04/hero30.png",
    ],
    transition: "t4",
  },
  {
    id: "block-05",
    images: [
      "/assets/Block05/hero32.png",
      "/assets/Block05/hero33.png",
      "/assets/Block05/hero34.png",
      "/assets/Block05/hero35.png",
      "/assets/Block05/hero36.png",
      "/assets/Block05/hero37.png",
      "/assets/Block05/hero38.png",
      "/assets/Block05/hero39.png",
    ],
    selected: [
      "/assets/Block05/hero32.png",
      "/assets/Block05/hero35.png",
      "/assets/Block05/hero38.png",
    ],
    transition: "t5",
  },
  {
    id: "block-06",
    images: [
      "/assets/Block06/hero40.png",
      "/assets/Block06/hero41.png",
      "/assets/Block06/hero42.png",
      "/assets/Block06/hero43.png",
      "/assets/Block06/hero44.png",
      "/assets/Block06/hero45.png",
      "/assets/Block06/hero46.png",
      "/assets/Block06/hero47.png",
    ],
    selected: [
      "/assets/Block06/hero40.png",
      "/assets/Block06/hero43.png",
      "/assets/Block06/hero46.png",
    ],
    transition: "final",
  },
];

/** Presets de tamaño por imagen → piezas de distinto tamaño sobre negro.
   Valores en vw/vh → ya responsive; object-fit: contain mantiene la imagen
   completa. NO hay zoom: el tamaño es fijo mientras la imagen está visible. */
type SizePreset = { maxWidth: string; maxHeight: string };
const SIZE_PRESETS: SizePreset[] = [
  { maxWidth: "min(72vw, 960px)", maxHeight: "min(62vh, 680px)" }, // large
  { maxWidth: "min(58vw, 760px)", maxHeight: "min(58vh, 620px)" }, // medium
  { maxWidth: "min(44vw, 560px)", maxHeight: "min(54vh, 560px)" }, // small
  { maxWidth: "min(64vw, 840px)", maxHeight: "min(64vh, 660px)" }, // tall
];

/** Presets de "pop-up creativo" — SIN rotación, SIN zoom en el hold. Cada
   imagen aparece como una ventana de estudio que se abre sobre negro:
   micro-escala de entrada (solo entrada/salida), máscara clip-path con
   esquinas redondeadas y desenfoque que se resuelve. El hold queda inmóvil.
   A = ventana central · B = apertura lateral · C = ventana que asciende. */
type RevealPreset = {
  from: Record<string, unknown>;
  to: Record<string, unknown>;
};
/* El radio de las esquinas se lee del CSS (--hero-popup-radius) y se inyecta
   en TODOS los clip-path (round) → la imagen, el marco y la máscara comparten
   siempre el mismo radio: nunca hay salto de forma redondeada↔cuadrada. */
const FULL_CLIP = (r: number) => `inset(0% 0% 0% 0% round ${r}px)`;

/* Captura rápida: la imagen "se dispara" — abre veloz con un golpe de
   exposición DENTRO de la propia imagen (brightness/contrast), recta y sin
   rotación. NO hay flash de pantalla. El radio (round) es SIEMPRE el mismo →
   nunca hay salto redondeada↔cuadrada. Tres variantes solo cambian la
   dirección de apertura del clip para dar ritmo, no la forma. */
const makeRevealPresets = (r: number): RevealPreset[] => [
  {
    from: {
      opacity: 0,
      scale: 0.975,
      x: 0,
      y: 8,
      clipPath: `inset(38% 38% 38% 38% round ${r}px)`,
      filter: "brightness(1.16) contrast(1.05) blur(4px)",
      transformOrigin: "50% 55%",
    },
    to: {
      opacity: 1,
      scale: 1,
      y: 0,
      clipPath: FULL_CLIP(r),
      filter: "brightness(1) contrast(1) blur(0px)",
      duration: 0.5,
      ease: "power4.out",
    },
  },
  {
    from: {
      opacity: 0,
      scale: 0.975,
      x: -8,
      y: 0,
      clipPath: `inset(30% 46% 30% 6% round ${r}px)`,
      filter: "brightness(1.16) contrast(1.05) blur(4px)",
      transformOrigin: "0% 50%",
    },
    to: {
      opacity: 1,
      scale: 1,
      x: 0,
      clipPath: FULL_CLIP(r),
      filter: "brightness(1) contrast(1) blur(0px)",
      duration: 0.52,
      ease: "power4.out",
    },
  },
  {
    from: {
      opacity: 0,
      scale: 0.975,
      x: 0,
      y: 10,
      clipPath: `inset(46% 26% 14% 26% round ${r}px)`,
      filter: "brightness(1.16) contrast(1.05) blur(4px)",
      transformOrigin: "50% 100%",
    },
    to: {
      opacity: 1,
      scale: 1,
      y: 0,
      clipPath: FULL_CLIP(r),
      filter: "brightness(1) contrast(1) blur(0px)",
      duration: 0.52,
      ease: "power4.out",
    },
  },
];

/** Salida rápida de la captura: sube apenas, micro-cierre del clip y leve
   golpe de exposición DENTRO de la imagen. Sin rotación. Mismo radio (round). */
const exitVars = (r: number) => ({
  opacity: 0,
  scale: 0.985,
  x: 0,
  y: -4,
  clipPath: `inset(8% 8% 8% 8% round ${r}px)`,
  filter: "brightness(1.08) contrast(1.02) blur(3px)",
  transformOrigin: "50% 50%",
  duration: 0.38,
  ease: "power3.inOut",
});

/** Lee el radio del pop-up desde el CSS para que el clip coincida con la
   imagen/marco en cualquier breakpoint (sin morphing de esquinas). */
const readPopupRadius = (root: HTMLElement): number => {
  const value = parseInt(
    getComputedStyle(root).getPropertyValue("--hero-popup-radius"),
    10,
  );
  return Number.isFinite(value) ? value : 22;
};

/* ── Vocabulario de la intro ───────────────────────────────────────────
   "Antes de la imagen, el sistema": dos estallidos tipográficos. Cada palabra
   es material de diseño (entra y SALE por máscara, no se queda fija como una
   lista). Composición asimétrica → ritmo de agencia, no PowerPoint. */
const BURST_A_WORDS = ["RITMO", "SISTEMA", "CRITERIO", "FORMA"];
const BURST_B_WORDS = ["DIRECCIÓN", "IDENTIDAD", "HILO", "ETECÉ"];
const GHOST_WORD = "SISTEMA"; // ruido → orden: copias que encajan

const TICKER_WORDS = [
  "BRANDING",
  "IDENTIDAD VISUAL",
  "DISEÑO WEB",
  "DIRECCIÓN CREATIVA",
  "ESTRATEGIA DE MARCA",
  "COMUNICACIÓN VISUAL",
  "DISEÑO EDITORIAL",
  "SISTEMAS DE MARCA",
  "CONTENIDO PARA REDES",
  "DISEÑO DE PACKAGING",
];

/** Precarga segura: nunca bloquea la web aunque una imagen falle. */
const preloadImage = (src: string): Promise<void> =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });

type IntroEls = {
  overlay: HTMLElement;
  dots: HTMLElement[];
  rule: HTMLElement | undefined;
  burstA: HTMLElement[];
  burstB: HTMLElement[];
  ghosts: HTMLElement[];
  phrase: HTMLElement | undefined;
  phraseLines: HTMLElement[];
  phraseRule: HTMLElement | undefined;
  phraseDot: HTMLElement | undefined;
  lockup: HTMLElement | undefined;
  word: HTMLElement | undefined;
  subword: HTMLElement | undefined;
  sweep: HTMLElement | undefined;
};

/** Estado oculto del pop-up de imagen (captura cerrada sobre negro). */
const imgHidden = (r: number) => ({
  opacity: 0,
  scale: 0.975,
  x: 0,
  y: 8,
  rotation: 0,
  clipPath: `inset(38% 38% 38% 38% round ${r}px)`,
  filter: "brightness(1.16) contrast(1.05) blur(4px)",
});

/**
 * Intro editorial kinética "antes de la imagen, el sistema" (≈7.2s, SOLO la
 * primera vuelta). Lenguaje de agencia premium: cortes rápidos, tipografía que
 * entra Y SALE por máscara (no se queda fija), composición asimétrica, rojo solo
 * como puntuación. Sin flash de pantalla, sin logo gigante.
 *   Beat 1 (0.00–0.70) apertura: 3 puntos rojos uno a uno + regla fina
 *   Beat 2 (0.70–1.60) Burst A: RITMO/SISTEMA/CRITERIO/FORMA — máscaras rápidas
 *   Beat 3 (1.60–2.60) Burst B: DIRECCIÓN(sobredimensionada)/IDENTIDAD/HILO/ETECÉ
 *   Beat 4 (2.60–3.60) ruido → orden: copias fantasma desalineadas que ENCAJAN
 *   Beat 5 (3.60–4.80) frase "ANTES DE LA IMAGEN, / EL SISTEMA." (máscara+regla)
 *   Beat 6 (4.80–6.20) build: los puntos vuelven como puntuación, limpia
 *   Beat 7 (6.20–7.20) lockup ETECÉ STUDIO → cierre por máscara+barrido →
 *                      compresión a tres puntos → overlay fuera (abre captura)
 */
function addExtendedIntro(tl: gsap.core.Timeline, els: IntroEls) {
  const {
    overlay, dots, rule, burstA, burstB, ghosts,
    phrase, phraseLines, phraseRule, phraseDot,
    lockup, word, subword, sweep,
  } = els;

  const REVEAL = "inset(0 0% 0 0)";
  const HIDE_R = "inset(0 100% 0 0)"; // oculto desde la derecha (revela L→R)
  const OUT_R = "inset(0 0 0 100%)";  // sale recortando L→R

  // ── Beat 1 · apertura (puntuación roja) ────────────────────
  tl.to({}, { duration: 0.22 });
  tl.to(dots, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.13, ease: "power4.out" });
  if (rule) {
    tl.fromTo(
      rule,
      { scaleX: 0, opacity: 0, transformOrigin: "left center" },
      { scaleX: 1, opacity: 0.42, duration: 0.46, ease: "power3.inOut" },
      "<0.05"
    );
  }
  tl.to(dots, { opacity: 0.38, scale: 0.78, duration: 0.24, ease: "power2.inOut" }, ">0.04");
  if (rule) tl.to(rule, { opacity: 0, duration: 0.26, ease: "power2.in" }, "<");

  // ── Beat 2 · Burst A (corte tipográfico veloz) ─────────────
  if (burstA.length) {
    tl.set(burstA, { clipPath: HIDE_R, opacity: 1, yPercent: 0 });
    tl.to(burstA, { clipPath: REVEAL, duration: 0.32, stagger: 0.09, ease: "power4.out" }, ">0.02");
    tl.to(burstA, { clipPath: OUT_R, duration: 0.24, stagger: 0.05, ease: "power3.in" }, ">0.3");
  }

  // ── Beat 3 · Burst B (composición asimétrica) ──────────────
  if (burstB.length) {
    tl.set(burstB, { clipPath: HIDE_R, opacity: 1 });
    tl.to(burstB, { clipPath: REVEAL, duration: 0.36, stagger: 0.08, ease: "power4.out" }, ">0.0");
    tl.to(dots, { opacity: 0.9, scale: 0.95, duration: 0.24, ease: "power2.out" }, "<0.12");
    tl.to(burstB, { clipPath: OUT_R, duration: 0.26, stagger: 0.05, ease: "power3.in" }, ">0.34");
  }

  // ── Beat 4 · ruido → orden (copias fantasma que encajan) ───
  if (ghosts.length) {
    const mid = Math.floor(ghosts.length / 2);
    tl.set(ghosts, {
      opacity: 0,
      xPercent: (i: number) => (i - mid) * 11,
      yPercent: (i: number) => (i - mid) * 6,
      rotation: (i: number) => (i - mid) * 1.6,
      clipPath: "inset(0 0 0 0)",
    });
    tl.to(ghosts, {
      opacity: (i: number) => (i === mid ? 1 : 0.16),
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out",
    }, ">0.04");
    // SNAP: las copias encajan en una sola estructura limpia.
    tl.to(ghosts, { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.32, ease: "power4.inOut" }, ">0.18");
    if (rule) {
      tl.fromTo(
        rule,
        { scaleX: 0, opacity: 0, transformOrigin: "center center" },
        { scaleX: 1, opacity: 0.5, duration: 0.3, ease: "power3.inOut" },
        "<"
      );
    }
    tl.to(ghosts, { clipPath: OUT_R, opacity: 0, duration: 0.3, ease: "power3.in" }, ">0.14");
    if (rule) tl.to(rule, { opacity: 0, duration: 0.26, ease: "power2.in" }, "<");
  }
  tl.to(dots, { opacity: 0, scale: 0.6, duration: 0.26, ease: "power2.in" }, "<");

  // ── Beat 5 · frase editorial (centro conceptual) ───────────
  if (phrase) tl.set(phrase, { autoAlpha: 1 }, ">0.04");
  if (phraseRule) {
    tl.fromTo(
      phraseRule,
      { scaleX: 0, opacity: 0, transformOrigin: "left center" },
      { scaleX: 1, opacity: 0.55, duration: 0.42, ease: "power3.inOut" }
    );
  }
  if (phraseLines.length) {
    tl.fromTo(
      phraseLines,
      { clipPath: HIDE_R, yPercent: 24, opacity: 1 },
      { clipPath: REVEAL, yPercent: 0, duration: 0.5, stagger: 0.16, ease: "power4.out" },
      "<0.05"
    );
  }
  if (phraseDot) {
    tl.fromTo(
      phraseDot,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.4)" },
      ">-0.12"
    );
  }
  tl.to({}, { duration: 0.46 }); // pausa de lectura
  if (phraseLines.length) {
    tl.to(phraseLines, { clipPath: OUT_R, duration: 0.34, stagger: 0.07, ease: "power3.in" });
  }
  if (phraseDot) tl.to(phraseDot, { scale: 0, opacity: 0, duration: 0.22, ease: "power2.in" }, "<");
  if (phraseRule) tl.to(phraseRule, { scaleX: 0, opacity: 0, transformOrigin: "right center", duration: 0.3, ease: "power3.in" }, "<");
  if (phrase) tl.set(phrase, { autoAlpha: 0 });

  // ── Beat 6 · build (los puntos vuelven como puntuación) ────
  tl.set(dots, { scale: 0.6, opacity: 0, x: 0, y: 0 });
  tl.to(dots, { scale: 1, opacity: 1, duration: 0.28, stagger: 0.07, ease: "power4.out" }, ">0.04");
  tl.to(dots, { opacity: 0.5, scale: 0.82, duration: 0.26, ease: "power2.inOut" }, ">0.12");

  // ── Beat 7 · lockup final ──────────────────────────────────
  if (lockup) tl.set(lockup, { opacity: 1 });
  if (word) {
    tl.fromTo(
      word,
      { clipPath: HIDE_R, opacity: 1, y: 0 },
      { clipPath: REVEAL, duration: 0.5, ease: "power3.out" },
      ">0.02"
    );
  }
  if (subword) {
    tl.fromTo(
      subword,
      { clipPath: HIDE_R, opacity: 1, y: 0 },
      { clipPath: REVEAL, duration: 0.4, ease: "power3.out" },
      ">-0.18"
    );
  }
  tl.to(dots, { opacity: 0, duration: 0.3, ease: "power2.in" }, "<0.1");
  tl.to({}, { duration: 0.5 }); // hold del lockup

  // Cierre: barrido rojo de registro + máscara + compresión a tres puntos.
  if (sweep) {
    tl.fromTo(
      sweep,
      { scaleX: 0, opacity: 1, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.3, ease: "power3.inOut" }
    );
  }
  if (word) tl.to(word, { clipPath: OUT_R, duration: 0.34, ease: "power3.in" }, "<0.02");
  if (subword) tl.to(subword, { clipPath: OUT_R, duration: 0.3, ease: "power3.in" }, "<0.05");
  if (sweep) tl.to(sweep, { scaleX: 0, transformOrigin: "right center", duration: 0.26, ease: "power3.in" }, "<");

  tl.set(dots, { scale: 0.6, opacity: 0 });
  tl.to(dots, { scale: 1, opacity: 1, duration: 0.24, stagger: 0.05, ease: "power4.out" }, ">0.02");
  tl.to(dots, { opacity: 0, duration: 0.2, ease: "power2.in" }, ">0.06");
  tl.to(overlay, { autoAlpha: 0, duration: 0.38, ease: "power2.inOut" });
}

/**
 * Reprise corta entre vueltas (≈1.15s): tres puntos rojos + un corte
 * tipográfico veloz (barrido), luego abre directamente la siguiente captura.
 * Sin repetir la intro larga, sin flash de pantalla.
 */
function addLoopReprise(
  tl: gsap.core.Timeline,
  _els: IntroEls,
  img: HTMLImageElement,
  radius: number
) {
  // Fallback seguro: sin overlay de intro entre vueltas — solo respiración en negro.
  tl.set(img, { ...imgHidden(radius) });
  tl.to({}, { duration: 0.12 });
}

/**
 * Sistema de tarjetas-divisor: cada frase entre bloques tiene su PROPIA
 * variante de movimiento (relacionadas, no idénticas). Tiempos: entrada
 * 0.4–0.65 · hold 0.65–0.95 · salida 0.35–0.55. Negro + tipografía blanca +
 * acentos rojos. Resetea sus elementos al inicio para que el bucle repita
 * limpio. No usa flash de pantalla, ni glitch, ni fade/scale centrado plano.
 */
function addDivider(tl: gsap.core.Timeline, tEl: HTMLElement, key: TransitionKey) {
  const sel = (s: string) => Array.from(tEl.querySelectorAll<HTMLElement>(s));
  const lines = sel("[data-tline]");
  const dots = sel("[data-tdot]");
  const ghosts = sel("[data-tghost]");
  const sweep = sel("[data-tsweep]")[0];
  const rule = sel("[data-trule]")[0];

  tl.set(tEl, { visibility: "visible", autoAlpha: 1 });

  switch (key) {
    // ── D1 · NOS ENCARGAMOS DE TODO ──────────────────────────
    // Fragmentos → barrido rojo de registro → estampado por máscara →
    // copias fantasma colapsan → salida recortando izquierda→derecha.
    case "t1": {
      tl.set(lines, { clipPath: "inset(0 100% 0 0)", yPercent: 26, opacity: 1 });
      if (ghosts.length) tl.set(ghosts, { opacity: 0, xPercent: -4, yPercent: 26 });
      if (sweep) {
        tl.set(sweep, { scaleX: 0, opacity: 1, transformOrigin: "left center" });
        tl.to(sweep, { scaleX: 1, duration: 0.32, ease: "power3.inOut" });
      }
      if (ghosts.length) tl.set(ghosts, { opacity: 0.16 }, "<0.06");
      tl.to(lines, { clipPath: "inset(0 0% 0 0)", yPercent: 0, duration: 0.5, stagger: 0.08, ease: "power4.out" }, "<");
      if (ghosts.length) tl.to(ghosts, { opacity: 0, xPercent: 0, yPercent: 0, duration: 0.34, ease: "power2.out" }, "<0.12");
      if (sweep) tl.to(sweep, { scaleX: 0, transformOrigin: "right center", duration: 0.26, ease: "power3.in" }, "<");
      tl.to({}, { duration: 0.52 });
      tl.to(lines, { clipPath: "inset(0 0 0 100%)", duration: 0.4, stagger: 0.06, ease: "power3.in" });
      tl.to(tEl, { autoAlpha: 0, duration: 0.2 }, ">-0.12");
      break;
    }

    // ── D2 · DE TODO LO DEMÁS ... ────────────────────────────
    // "DE TODO" entra primero, "LO DEMÁS" encaja después, los puntos
    // aparecen uno a uno (rojos) y LIDERAN la salida.
    case "t2": {
      tl.set(lines, { yPercent: 72, opacity: 0, clipPath: "inset(0 0 100% 0)" });
      if (dots.length) tl.set(dots, { scale: 0, opacity: 0 });
      tl.to(lines[0], { yPercent: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.42, ease: "power3.out" });
      if (lines[1]) tl.to(lines[1], { yPercent: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.42, ease: "power3.out" }, ">-0.16");
      if (dots.length) tl.to(dots, { scale: 1, opacity: 1, duration: 0.26, stagger: 0.1, ease: "back.out(2)" }, ">-0.04");
      tl.to({}, { duration: 0.5 });
      if (dots.length) tl.to(dots, { scale: 0, opacity: 0, duration: 0.28, stagger: 0.06, ease: "power2.in" });
      tl.to(lines, { yPercent: -56, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power3.in" }, ">-0.2");
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.12");
      break;
    }

    // ── D3 · TE IMPULSAMOS ───────────────────────────────────
    // Enérgico: regla roja vertical, máscara direccional rápida, la palabra
    // entra dividida en dos capas desfasadas que encajan, salida hacia arriba.
    case "t3": {
      if (rule) tl.set(rule, { scaleY: 0, opacity: 1, transformOrigin: "center top" });
      if (rule) tl.to(rule, { scaleY: 1, duration: 0.3, ease: "power4.out" });
      if (lines[0]) tl.fromTo(lines[0], { opacity: 0, x: -46 }, { opacity: 1, x: 0, duration: 0.32, ease: "power4.out" }, "<");
      if (lines[1]) tl.fromTo(lines[1], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, ease: "power4.out" }, "<0.06");
      if (ghosts[0]) tl.fromTo(ghosts[0], { opacity: 0.45, x: 32 }, { opacity: 0, x: 0, duration: 0.44, ease: "power3.out" }, "<");
      tl.to({}, { duration: 0.5 });
      const exit3 = [lines[0], lines[1]].filter(Boolean) as HTMLElement[];
      tl.to(exit3, { yPercent: -125, opacity: 0, duration: 0.42, stagger: 0.05, ease: "power3.in" });
      if (rule) tl.to(rule, { scaleY: 0, transformOrigin: "center bottom", duration: 0.3, ease: "power3.in" }, "<");
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.12");
      break;
    }

    // ── D4 · MENOS RUIDO ─────────────────────────────────────
    // Varias copias fantasma desfasadas y muy tenues colapsan en una sola
    // frase limpia (ruido → claridad). Salida comprimiendo a una línea fina.
    case "t4": {
      tl.set(lines, { opacity: 0, yPercent: 20 });
      if (ghosts.length) {
        tl.set(ghosts, {
          opacity: 0,
          x: (i: number) => (i - (ghosts.length - 1) / 2) * 16,
          y: (i: number) => (i - (ghosts.length - 1) / 2) * 9,
        });
        tl.to(ghosts, { opacity: 0.13, duration: 0.32, stagger: 0.05, ease: "power2.out" });
      }
      tl.to(lines, { opacity: 1, yPercent: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }, ">0.04");
      if (ghosts.length) tl.to(ghosts, { opacity: 0, x: 0, y: 0, duration: 0.42, ease: "power3.inOut" }, "<");
      tl.to({}, { duration: 0.5 });
      tl.to(lines, { scaleY: 0.04, opacity: 0, transformOrigin: "center center", duration: 0.42, ease: "power3.in" });
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.12");
      break;
    }

    // ── D5 · EMPIEZA EVOLUCIONA ESCALA ───────────────────────
    // Tres palabras como pasos de un sistema (EVOLUCIONA en rojo). Composición
    // progresiva → se alinean un instante → se recortan al salir.
    case "t5": {
      tl.set(lines, { opacity: 0, yPercent: 64, clipPath: "inset(0 0 100% 0)", x: 0 });
      tl.to(lines, { opacity: 1, yPercent: 0, clipPath: "inset(0 0 0% 0)", duration: 0.4, stagger: 0.14, ease: "power3.out" });
      tl.to({}, { duration: 0.5 });
      tl.to(lines, { x: 0, letterSpacing: "0em", duration: 0.24, ease: "power2.inOut" });
      tl.to(lines, { clipPath: "inset(0 0 0 100%)", opacity: 0, duration: 0.4, stagger: 0.06, ease: "power3.in" }, ">0.04");
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.12");
      break;
    }

    // ── D6 · ··· (eco de la apertura) ────────────────────────
    case "final": {
      tl.set(dots, { scale: 0, opacity: 0, x: 0, y: 0 });
      tl.to(dots, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.12, ease: "back.out(2)" });
      tl.to(dots, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }, ">0.05");
      tl.to({}, { duration: 0.5 });
      tl.to(dots, { scale: 0.5, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in" });
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.1");
      break;
    }
  }

  tl.set(tEl, { visibility: "hidden" });
}

/** Secuencia de capturas (pop-ups de flash de cámara) + tarjetas-divisor.
   La parte de imágenes NO se toca; los divisores se delegan en addDivider. */
function addSequence(
  tl: gsap.core.Timeline,
  img: HTMLImageElement,
  popFrame: HTMLElement | undefined,
  transitions: Map<TransitionKey, HTMLElement>,
  radius: number
) {
  const presets = makeRevealPresets(radius);
  let counter = 0;
  HERO_BLOCKS.forEach((block) => {
    block.selected.forEach((src) => {
      const size = SIZE_PRESETS[counter % SIZE_PRESETS.length];
      const preset = presets[counter % presets.length];
      const popLabel = `pop-${counter}`;
      counter += 1;

      // src + tamaño fijo (mientras opacity 0 → swap seguro). rotation 0 SIEMPRE.
      tl.call(() => {
        img.src = src;
      });
      tl.set(img, { maxWidth: size.maxWidth, maxHeight: size.maxHeight, rotation: 0 });

      // Cue de captura LOCAL (sin flash de pantalla): un filo rojo parpadea
      // alrededor del marco — opacity 0→1→0 (~0.18s). Acento del "disparo".
      tl.addLabel(popLabel);
      if (popFrame) {
        tl.fromTo(popFrame, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "power2.out" }, popLabel);
        tl.to(popFrame, { opacity: 0, duration: 0.12, ease: "power2.in" });
      }

      // Captura: la imagen abre rápido con golpe de exposición DENTRO de ella.
      tl.fromTo(img, { ...preset.from }, { ...preset.to }, `${popLabel}+=0.06`);

      // Hold INMÓVIL (≈0.95s): ningún tween de scale/x/y/rotation/clip.
      tl.to({}, { duration: 0.95 });

      // Cierre rápido de la captura.
      tl.to(img, { ...exitVars(radius) });

      // Respiración en negro muy corta → siguiente disparo.
      tl.to({}, { duration: 0.08 });
    });

    const tEl = transitions.get(block.transition);
    if (!tEl) return;
    addDivider(tl, tEl, block.transition);
  });
}

/**
 * Construye el timeline cinemático local del hero:
 *   master = intro kinética (1 vez) → loop infinito [secuencia → reprise].
 * Las imágenes son ventanas que se abren sobre negro: pop-up de entrada,
 * hold inmóvil (sin zoom/Ken Burns) y cierre. Devuelve el timeline maestro.
 */
function buildHeroTimeline(root: HTMLDivElement, img: HTMLImageElement): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const overlay = q<HTMLElement>("[data-overlay]")[0];
  const dots = q<HTMLElement>("[data-intro-dot]");
  const rule = q<HTMLElement>("[data-intro-rule]")[0];
  const burstA = q<HTMLElement>("[data-fraga]");
  const burstB = q<HTMLElement>("[data-fragb]");
  const ghosts = q<HTMLElement>("[data-ghost]");
  const phrase = q<HTMLElement>("[data-intro-phrase]")[0];
  const phraseLines = q<HTMLElement>("[data-intro-phrase-line]");
  const phraseRule = q<HTMLElement>("[data-intro-phrase-rule]")[0];
  const phraseDot = q<HTMLElement>("[data-intro-phrase-dot]")[0];
  const lockup = q<HTMLElement>("[data-intro-lockup]")[0];
  const word = q<HTMLElement>("[data-intro-word]")[0];
  const subword = q<HTMLElement>("[data-intro-subword]")[0];
  const sweep = q<HTMLElement>("[data-intro-sweep]")[0];
  const popFrame = q<HTMLElement>("[data-pop-frame]")[0];
  const transitions = new Map<TransitionKey, HTMLElement>();
  (["t1", "t2", "t3", "t4", "t5", "final"] as TransitionKey[]).forEach((key) => {
    const el = q<HTMLElement>(`[data-transition="${key}"]`)[0];
    if (el) transitions.set(key, el);
  });

  const els: IntroEls = {
    overlay, dots, rule, burstA, burstB, ghosts,
    phrase, phraseLines, phraseRule, phraseDot,
    lockup, word, subword, sweep,
  };
  const radius = readPopupRadius(root);

  // ── Estado inicial ───────────────────────────────────────────
  gsap.set(img, { ...imgHidden(radius) });
  // Intro kinética desactivada (fallback seguro): overlay oculto → la secuencia
  // de imágenes arranca de inmediato sobre negro, sin animación de intro.
  if (overlay) gsap.set(overlay, { autoAlpha: 0 });
  gsap.set(dots, { scale: 0, opacity: 0, x: 0, y: 0 });
  if (rule) gsap.set(rule, { scaleX: 0, opacity: 0 });
  if (burstA.length) gsap.set(burstA, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
  if (burstB.length) gsap.set(burstB, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
  if (ghosts.length) gsap.set(ghosts, { opacity: 0 });
  if (phrase) gsap.set(phrase, { autoAlpha: 0 });
  if (phraseLines.length) gsap.set(phraseLines, { clipPath: "inset(0 100% 0 0)", opacity: 1 });
  if (phraseRule) gsap.set(phraseRule, { scaleX: 0, opacity: 0 });
  if (phraseDot) gsap.set(phraseDot, { scale: 0, opacity: 0 });
  if (word) gsap.set(word, { clipPath: "inset(0 100% 0 0)", opacity: 1 });
  if (subword) gsap.set(subword, { clipPath: "inset(0 100% 0 0)", opacity: 1, y: 0 });
  if (lockup) gsap.set(lockup, { opacity: 1, y: 0, scale: 1 });
  if (popFrame) gsap.set(popFrame, { opacity: 0 });
  if (sweep) gsap.set(sweep, { scaleX: 0, opacity: 0, transformOrigin: "left center" });
  transitions.forEach((el) => gsap.set(el, { autoAlpha: 0, visibility: "hidden" }));

  const master = gsap.timeline({ defaults: { ease: "power2.out" } });

  // Intro kinética desactivada temporalmente (reparación de estabilidad).
  // addExtendedIntro(master, els);

  // Bucle infinito: ráfaga de capturas → reprise corta de tres puntos.
  const loop = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
  addSequence(loop, img, popFrame, transitions, radius);
  addLoopReprise(loop, els, img, radius);
  master.add(loop);

  return master;
}

const TRANSITIONS: { key: TransitionKey; render: () => ReactNode }[] = [
  {
    key: "t1",
    render: () => (
      <div className={`${styles.transition} ${styles.t1}`} data-transition="t1">
        <div className={styles.t1Stage}>
          <span className={styles.t1Sweep} data-tsweep aria-hidden="true" />
          <p className={styles.tStack}>
            <span className={styles.tSmall} data-tline>
              NOS ENCARGAMOS
            </span>
            <span className={`${styles.tHuge} ${styles.tUnderline}`} data-tline>
              DE TODO
            </span>
          </p>
          <p className={`${styles.tStack} ${styles.t1Ghost}`} data-tghost aria-hidden="true">
            <span className={styles.tSmall}>NOS ENCARGAMOS</span>
            <span className={styles.tHuge}>DE TODO</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "t2",
    render: () => (
      <div className={`${styles.transition} ${styles.t2}`} data-transition="t2">
        <p className={styles.tStack}>
          <span className={styles.tHuge} data-tline>
            DE TODO
          </span>
          <span className={`${styles.tHuge} ${styles.tOutline}`} data-tline>
            LO DEMÁS
          </span>
          <span className={styles.tDots}>
            <i data-tdot />
            <i data-tdot />
            <i data-tdot />
          </span>
        </p>
      </div>
    ),
  },
  {
    key: "t3",
    render: () => (
      <div className={`${styles.transition} ${styles.t3}`} data-transition="t3">
        <div className={styles.t3Stage}>
          <span className={styles.t3Rule} data-trule aria-hidden="true" />
          <p className={styles.tDiagonal}>
            <span className={styles.tTag} data-tline>
              TE
            </span>
            <span className={styles.t3WordWrap}>
              <span className={styles.tStretch} data-tline>
                IMPULSAMOS
              </span>
              <span className={`${styles.tStretch} ${styles.t3Ghost}`} data-tghost aria-hidden="true">
                IMPULSAMOS
              </span>
            </span>
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "t4",
    render: () => (
      <div className={`${styles.transition} ${styles.t4}`} data-transition="t4">
        <div className={styles.t4Stage}>
          {[0, 1, 2].map((i) => (
            <p className={`${styles.tStack} ${styles.t4Ghost}`} data-tghost aria-hidden="true" key={`g-${i}`}>
              <span className={styles.tSmall}>MENOS</span>
              <span className={styles.tHuge}>RUIDO</span>
            </p>
          ))}
          <p className={styles.tStack}>
            <span className={styles.tSmall} data-tline>
              MENOS
            </span>
            <span className={`${styles.tHuge} ${styles.tStrike}`} data-tline>
              RUIDO
            </span>
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "t5",
    render: () => (
      <div className={`${styles.transition} ${styles.t5}`} data-transition="t5">
        <div className={styles.tSteps}>
          <p className={styles.tStep1} data-tline>
            EMPIEZA
          </p>
          <p className={styles.tStep2} data-tline>
            EVOLUCIONA
          </p>
          <p className={styles.tStep3} data-tline>
            ESCALA
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "final",
    render: () => (
      <div className={`${styles.transition} ${styles.tFinal}`} data-transition="final">
        <span className={styles.tFinalDots}>
          <i data-tdot />
          <i data-tdot />
          <i data-tdot />
        </span>
      </div>
    ),
  },
];

export function HeroCinematic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const img = imgRef.current;
    if (!root || !img) return;

    // Garantizar que la web/nav/logo permanecen visibles (no ocultar nada).
    document.body.dataset.heroIntro = "done";
    document.body.dataset.heroFlow = "complete";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selectedAll = HERO_BLOCKS.flatMap((block) => block.selected);

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    const ctx = gsap.context(() => {}, root);

    const start = async () => {
      await waitForSiteReveal();
      if (cancelled) return;

      if (reduceMotion) {
        // Hero estático: una sola imagen fija, recta, sobre negro.
        const size = SIZE_PRESETS[0];
        img.src = selectedAll[0];
        gsap.set(img, {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          clipPath: FULL_CLIP(readPopupRadius(root)),
          filter: "brightness(1) contrast(1) blur(0px)",
          maxWidth: size.maxWidth,
          maxHeight: size.maxHeight,
        });
        const overlay = root.querySelector<HTMLElement>("[data-overlay]");
        if (overlay) gsap.set(overlay, { autoAlpha: 0 });
        return;
      }

      await Promise.all(selectedAll.map(preloadImage));
      if (cancelled) return;
      ctx.add(() => {
        try {
          tl = buildHeroTimeline(root, img);
          timelineRef.current = tl;
          // Si el hero no está visible al terminar la precarga, no arranca.
          if (!heroVisible) tl.pause();
        } catch (err) {
          console.error("[HeroCinematic] timeline failed — using static fallback", err);
          const overlay = root.querySelector<HTMLElement>("[data-overlay]");
          if (overlay) gsap.set(overlay, { autoAlpha: 0 });
          const size = SIZE_PRESETS[0];
          img.src = selectedAll[0];
          gsap.set(img, {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0,
            clipPath: FULL_CLIP(readPopupRadius(root)),
            filter: "brightness(1) contrast(1) blur(0px)",
            maxWidth: size.maxWidth,
            maxHeight: size.maxHeight,
          });
        }
      });
    };

    // Pausa/reanuda la secuencia según la visibilidad del hero (sin tocar el
    // ticker, que es CSS, ni el scroll). Observa el root real del hero.
    let heroVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.25) {
          heroVisible = true;
          timelineRef.current?.play();
        } else if (entry.intersectionRatio <= 0.05) {
          heroVisible = false;
          timelineRef.current?.pause();
        }
      },
      { threshold: [0, 0.05, 0.25, 0.5, 1] },
    );
    observer.observe(root);

    void start();

    return () => {
      cancelled = true;
      observer.disconnect();
      tl?.kill();
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Escenario de imágenes: ventanas que se abren sobre negro (no a pantalla completa) */}
      <div className={styles.stage}>
        <div className={styles.frame}>
          <img ref={imgRef} className={styles.sequenceImage} alt="" decoding="async" />
          {/* Cue local de captura: filo rojo fino que parpadea alrededor del
              marco al abrir cada imagen (sin flash de pantalla, sin iconos). */}
          <span className={styles.popFrame} data-pop-frame aria-hidden="true" />
        </div>
      </div>

      {/* Capa de tarjetas-divisor editoriales */}
      <div className={styles.transitionsLayer}>
        {TRANSITIONS.map((t) => (
          <div key={t.key}>{t.render()}</div>
        ))}
      </div>

      {/* Capa de intro — desactivada (fallback seguro). Se mantiene en el DOM
          para que el timeline/divisores sigan teniendo su scope; GSAP la deja
          oculta y la secuencia de imágenes arranca directamente. */}
      <div className={styles.overlay} data-overlay aria-hidden="true" hidden>
        <div className={styles.introStage} />
      </div>

      {/* Ticker rojo permanente (animado por CSS, independiente del timeline) */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {TICKER_WORDS.map((word, i) => (
            <span key={`a-${i}`}>{word}</span>
          ))}
          {TICKER_WORDS.map((word, i) => (
            <span key={`b-${i}`}>{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
