"use client";

import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HeroCinematic.module.css";

/* ============================================================
   ETECÉ · Hero editorial (fondo negro) — collage de tarjetas
   "Un escritorio creativo en movimiento": las capturas (Block01–06)
   se presentan como un STACK de tarjetas superpuestas que se barajan
   con ritmo (sin intro, sin texto previo). Entre bloques siguen las
   tarjetas-divisor editoriales. Ticker rojo permanente abajo.

   SEGURIDAD:
   - Timeline 100% local (gsap.context con scope en el hero).
   - No oculta la web: nav/logo siempre visibles (heroIntro="done").
   - No toca body/html overflow, ni overlays fijos fuera del hero.
   - El ticker se mueve con CSS, independiente del timeline.
   - Las esquinas redondeadas (--hero-card-radius) nunca se animan.
   ============================================================ */

type HeroBlock = {
  id: string;
  /** Set completo del bloque (orden y agrupación originales). */
  images: string[];
  /** Subconjunto curado que pasa a primer plano (orden original). */
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

/* ── Collage de tarjetas ───────────────────────────────────────────────
   POOL_SIZE tarjetas físicas (DOM) que se reciclan en bucle. En cada "beat"
   la tarjeta más al fondo se recoloca arriba con la siguiente imagen y el
   resto retrocede una posición → la pila se baraja sin caos. */
const POOL_SIZE = 5;

/* Posición de una tarjeta en una ranura de la pila. Offsets en PORCENTAJE del
   propio tamaño de la tarjeta (xPercent/yPercent) → responsive por definición y
   sin morphing de esquinas (el radio nunca se anima). Índice 0 = frontal/activa. */
type CardPos = {
  xPercent: number;
  yPercent: number;
  rotate: number;
  scale: number;
  z: number;
  opacity: number;
};

/* MÓVIL — "stack vertical grande y enfocado" (se conserva la dirección actual
   que funciona en móvil): 3 tarjetas, compactas, pequeñas rotaciones. */
const MOBILE_PRESETS: CardPos[] = [
  { xPercent: 0, yPercent: 0, rotate: 0, scale: 1.0, z: 50, opacity: 1 },
  { xPercent: -11, yPercent: 7, rotate: -6, scale: 0.94, z: 40, opacity: 1 },
  { xPercent: 12, yPercent: -6, rotate: 5, scale: 0.92, z: 30, opacity: 0.95 },
];

/* NO MÓVIL — "raíl editorial horizontal": tarjeta activa al centro y dominante,
   apoyos a izquierda/derecha, lejanas más afuera. Lectura horizontal, no vertical.
   Offsets en % → la composición usa el ancho disponible sin reventar el viewport. */
const DESKTOP_PRESETS: CardPos[] = [
  { xPercent: 0, yPercent: 0, rotate: 0, scale: 1.0, z: 50, opacity: 1 },
  { xPercent: -34, yPercent: 7, rotate: -5, scale: 0.9, z: 40, opacity: 1 },
  { xPercent: 34, yPercent: -6, rotate: 4, scale: 0.9, z: 30, opacity: 0.96 },
  { xPercent: -60, yPercent: -8, rotate: 3, scale: 0.78, z: 20, opacity: 0.85 },
  { xPercent: 60, yPercent: 9, rotate: -3, scale: 0.8, z: 10, opacity: 0.82 },
];

type LayoutCategory = "mobile" | "tablet" | "desktop";

type LayoutMode = {
  category: LayoutCategory;
  presets: CardPos[];
  /** Multiplica los offsets x/y (tablet reduce ≈20%). */
  offset: number;
  /** Suaviza las rotaciones en pantallas pequeñas. */
  rot: number;
  /** Tarjetas realmente visibles (las demás quedan a opacity 0). */
  visible: number;
  /** xPercent/yPercent de entrada (móvil: desde abajo · no-móvil: desde la derecha). */
  fromX: number;
  fromY: number;
};

/** Decide el layout según viewport (solo cliente; SSR → desktop estable). */
const getLayout = (): LayoutMode => {
  const w = typeof window === "undefined" ? 1280 : window.innerWidth;
  if (w <= 768) {
    return { category: "mobile", presets: MOBILE_PRESETS, offset: 1, rot: 1, visible: 3, fromX: 0, fromY: 30 };
  }
  if (w <= 1024) {
    return { category: "tablet", presets: DESKTOP_PRESETS, offset: 0.8, rot: 0.9, visible: 4, fromX: 64, fromY: 22 };
  }
  return { category: "desktop", presets: DESKTOP_PRESETS, offset: 1, rot: 1, visible: 5, fromX: 70, fromY: 24 };
};

/** Variables GSAP para una tarjeta en una ranura concreta de la pila. */
const slotVars = (slot: number, mode: LayoutMode) => {
  const p = mode.presets[Math.min(slot, mode.presets.length - 1)];
  const hidden = slot >= mode.visible || slot >= mode.presets.length;
  return {
    xPercent: p.xPercent * mode.offset,
    yPercent: p.yPercent * mode.offset,
    rotation: p.rotate * mode.rot,
    scale: p.scale,
    zIndex: p.z,
    opacity: hidden ? 0 : p.opacity,
  };
};

/** Estado de entrada de la tarjeta entrante (antes de asentarse en el frente):
   móvil → sube desde abajo · no-móvil → entra desde la derecha/inferior-derecha.
   Pequeña, ligeramente girada, invisible y por encima. */
const incomingVars = (mode: LayoutMode) => ({
  xPercent: mode.fromX,
  yPercent: mode.fromY,
  rotation: gsap.utils.random(-5, 5) * mode.rot,
  scale: 0.9,
  zIndex: 60,
  opacity: 0,
});

type Card = { el: HTMLElement; img: HTMLImageElement };

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
    case "t5": {
      tl.set(lines, { opacity: 0, yPercent: 64, clipPath: "inset(0 0 100% 0)", x: 0 });
      tl.to(lines, { opacity: 1, yPercent: 0, clipPath: "inset(0 0 0% 0)", duration: 0.4, stagger: 0.14, ease: "power3.out" });
      tl.to({}, { duration: 0.5 });
      tl.to(lines, { x: 0, letterSpacing: "0em", duration: 0.24, ease: "power2.inOut" });
      tl.to(lines, { clipPath: "inset(0 0 0 100%)", opacity: 0, duration: 0.4, stagger: 0.06, ease: "power3.in" }, ">0.04");
      tl.to(tEl, { autoAlpha: 0, duration: 0.18 }, ">-0.12");
      break;
    }

    // ── D6 · ··· (eco de cierre) ─────────────────────────────
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

/**
 * "Reparto" inicial del collage: las tarjetas ya son visibles (placeStatic);
 * aquí solo se aseguran los src y se anima un aterrizaje suave en cada ranura
 * SIN volver a opacity:0 (evita pantalla negra si el timeline se pausa).
 */
function addDealIn(tl: gsap.core.Timeline, cards: Card[], mode: LayoutMode) {
  const dealImages = HERO_BLOCKS[0].images;
  cards.forEach((card, i) => {
    const slot = slotVars(i, mode);
    if (card.img) card.img.src = dealImages[i % dealImages.length];
    if (slot.opacity === 0) {
      gsap.set(card.el, slot);
      return;
    }
    tl.fromTo(
      card.el,
      {
        xPercent: slot.xPercent,
        yPercent: slot.yPercent + (mode.category === "mobile" ? 16 : 10),
        scale: 0.92,
        rotation: slot.rotation * 0.6,
        opacity: 0.75,
        zIndex: slot.zIndex,
      },
      { ...slot, duration: 0.52, ease: "power3.out" },
      i === 0 ? ">" : "<0.08",
    );
  });
  tl.to({}, { duration: 0.4 });
}

/**
 * Un "beat" del collage: la tarjeta más al fondo se recicla → recibe la
 * siguiente imagen, sube al frente desde abajo y el resto retrocede una
 * ranura. Mantiene la pila compacta y viva, sin reposiciones bruscas.
 * Devuelve el nuevo orden lógico (frente→fondo).
 */
function addBeat(tl: gsap.core.Timeline, stack: Card[], src: string, mode: LayoutMode): Card[] {
  const recyc = stack[stack.length - 1];

  // La más al fondo (apenas visible) se desvanece y se recicla arriba.
  tl.to(recyc.el, { opacity: 0, duration: 0.3, ease: "power2.in" });
  tl.call(() => {
    if (recyc.img) recyc.img.src = src;
  });
  tl.set(recyc.el, { ...incomingVars(mode) });

  const next = [recyc, ...stack.slice(0, stack.length - 1)];

  // La entrante es "seleccionada del raíl" hacia el frente (corrección de giro a
  // 0º, potente); las demás se reordenan a lo largo del raíl (suave, escalonadas).
  next.forEach((card, i) => {
    if (i === 0) {
      tl.to(card.el, { ...slotVars(0, mode), duration: 0.6, ease: "power3.out" }, ">-0.02");
    } else {
      tl.to(card.el, { ...slotVars(i, mode), duration: 0.66, ease: "power3.inOut", delay: (i - 1) * 0.04 }, "<");
    }
  });

  // Hold tranquilo antes del siguiente cambio.
  tl.to({}, { duration: 0.85 });
  return next;
}

/**
 * Construye el timeline local del hero:
 *   reparto inicial → bucle infinito [por bloque: beats de tarjetas → divisor].
 * Las tarjetas se reciclan de forma continua (la pila nunca se vacía).
 */
function buildHeroTimeline(root: HTMLDivElement, mode: LayoutMode): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const cardEls = q<HTMLElement>("[data-card]");
  const cards: Card[] = cardEls
    .map((el) => {
      const img = el.querySelector("img");
      if (!img) return null;
      return { el, img };
    })
    .filter((c): c is Card => c !== null);
  if (!cards.length) {
    return gsap.timeline();
  }
  const transitions = new Map<TransitionKey, HTMLElement>();
  (["t1", "t2", "t3", "t4", "t5", "final"] as TransitionKey[]).forEach((key) => {
    const el = q<HTMLElement>(`[data-transition="${key}"]`)[0];
    if (el) transitions.set(key, el);
  });

  // Estado inicial: cada tarjeta en su ranura (visibles según layout); divisores fuera.
  cards.forEach((card, i) => {
    gsap.set(card.el, slotVars(i, mode));
  });
  transitions.forEach((el) => gsap.set(el, { autoAlpha: 0, visibility: "hidden" }));

  const master = gsap.timeline({ defaults: { ease: "power2.out" } });

  // Reparto inicial (una vez).
  addDealIn(master, cards, mode);

  // Bucle infinito: collage por bloque + divisor entre bloques. La pila se
  // recicla de forma continua entre vueltas (sin re-reparto, sin saltos).
  const loop = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
  let stack = [...cards];
  HERO_BLOCKS.forEach((block) => {
    block.selected.forEach((src) => {
      stack = addBeat(loop, stack, src, mode);
    });
    const tEl = transitions.get(block.transition);
    if (tEl) addDivider(loop, tEl, block.transition);
  });
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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Garantizar que la web/nav/logo permanecen visibles (no ocultar nada).
    document.body.dataset.heroIntro = "done";
    document.body.dataset.heroFlow = "complete";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Imágenes que realmente se usan: reparto inicial (Block01) + selección de
    // cada bloque que pasa a primer plano.
    const usedImages = Array.from(
      new Set([
        ...HERO_BLOCKS[0].images.slice(0, POOL_SIZE),
        ...HERO_BLOCKS.flatMap((b) => b.selected),
      ]),
    );

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    let heroVisible = true;
    let builtCategory: LayoutCategory | null = null;
    const ctx = gsap.context(() => {}, root);

    const placeStatic = () => {
      const mode = getLayout();
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
      const deal = HERO_BLOCKS[0].images;
      els.forEach((el, i) => {
        const img = el.querySelector("img");
        if (img && !img.getAttribute("src")) {
          img.src = deal[i % deal.length];
        }
        gsap.set(el, { ...slotVars(i, mode) });
      });
    };

    // Visibilidad inmediata (antes de preloader-reveal / precarga / timeline).
    placeStatic();

    // (Re)construye el timeline para el layout actual. Se reutiliza en el arranque
    // y cuando el viewport cruza un breakpoint (móvil ↔ tablet ↔ desktop).
    const buildForCurrentLayout = () => {
      const mode = getLayout();
      builtCategory = mode.category;
      placeStatic();
      ctx.add(() => {
        try {
          tl?.kill();
          tl = buildHeroTimeline(root, mode);
          timelineRef.current = tl;
          tl.play();
          if (!heroVisible && tl.time() > 1) tl.pause();
        } catch (err) {
          console.error("[HeroCinematic] timeline failed — using static fallback", err);
          placeStatic();
        }
      });
    };

    const start = async () => {
      await waitForSiteReveal();
      if (cancelled) return;

      if (reduceMotion) {
        placeStatic();
        return;
      }

      await Promise.all(usedImages.map(preloadImage));
      if (cancelled) return;
      buildForCurrentLayout();
    };

    // Pausa/reanuda según visibilidad del hero (sin tocar el ticker, que es CSS).
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

    // Resize seguro (debounce): solo reconstruye si cambia la CATEGORÍA de layout
    // (móvil↔no-móvil↔tablet) → evita rebuilds en cada píxel y cambios de orientación.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (cancelled || reduceMotion) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled) return;
        if (getLayout().category !== builtCategory) buildForCurrentLayout();
      }, 260);
    };
    window.addEventListener("resize", onResize);

    void start();

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      tl?.kill();
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Escenario del collage: pila compacta de tarjetas sobre negro. */}
      <div className={styles.stage}>
        <div className={styles.cardStack}>
          {Array.from({ length: POOL_SIZE }).map((_, i) => (
            <div className={styles.card} data-card key={`card-${i}`}>
              <img
                alt=""
                decoding="async"
                src={HERO_BLOCKS[0].images[i % HERO_BLOCKS[0].images.length]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Capa de tarjetas-divisor editoriales (entre bloques) */}
      <div className={styles.transitionsLayer}>
        {TRANSITIONS.map((t) => (
          <div key={t.key}>{t.render()}</div>
        ))}
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
