"use client";

import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";
import { useEffect, useRef } from "react";
import styles from "./HeroCinematic.module.css";

/* ============================================================
   ETECÉ · Hero collage de tarjetas apiladas (fondo negro)
   Sin intro. Arranca directamente con el stack de imágenes.
   Ticker rojo permanente abajo (CSS, independiente del timeline).
   ============================================================ */

type HeroBlock = {
  id: string;
  images: string[];
  selected: string[];
};

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
  },
];

/** Lista plana de imágenes activas (orden de bloques preservado). */
const ALL_IMAGES = HERO_BLOCKS.flatMap((block) => block.selected);

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

const CARD_COUNT = 5;

type StackPreset = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
};

/** Presets de posición del stack (frente → fondo). Desktop: 5 tarjetas. */
const DESKTOP_PRESETS: StackPreset[] = [
  { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 5 },
  { x: -42, y: 20, rotate: -7, scale: 0.94, zIndex: 4 },
  { x: 44, y: -18, rotate: 6, scale: 0.92, zIndex: 3 },
  { x: -12, y: -42, rotate: 3, scale: 0.9, zIndex: 2 },
  { x: 28, y: 38, rotate: -4, scale: 0.88, zIndex: 1 },
];

/** Tablet: offsets ~20% menores, 4 tarjetas visibles. */
const TABLET_PRESETS: StackPreset[] = [
  { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 5 },
  { x: -34, y: 16, rotate: -6, scale: 0.94, zIndex: 4 },
  { x: 35, y: -14, rotate: 5, scale: 0.91, zIndex: 3 },
  { x: -10, y: -34, rotate: 2.5, scale: 0.89, zIndex: 2 },
];

/** Mobile: 3 tarjetas, offsets contenidos. */
const MOBILE_PRESETS: StackPreset[] = [
  { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 5 },
  { x: -18, y: 14, rotate: -5, scale: 0.94, zIndex: 4 },
  { x: 16, y: -12, rotate: 4, scale: 0.91, zIndex: 3 },
];

const ENTER_DUR = 0.55;
const HOLD_DUR = 0.85;
const SHUFFLE_DUR = 0.55;

/** Precarga segura: nunca bloquea la web aunque una imagen falle. */
const preloadImage = (src: string): Promise<void> =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });

const setCardImage = (card: HTMLElement, src: string) => {
  const img = card.querySelector("img");
  if (img) img.src = src;
};

const applyPreset = (
  card: HTMLElement,
  preset: StackPreset,
  immediate = false,
) => {
  const vars = {
    x: preset.x,
    y: preset.y,
    rotation: preset.rotate,
    scale: preset.scale,
    zIndex: preset.zIndex,
    opacity: 1,
    autoAlpha: 1,
  };
  if (immediate) gsap.set(card, vars);
  else gsap.to(card, { ...vars, duration: SHUFFLE_DUR, ease: "power2.inOut" });
};

/**
 * Añade un ciclo de reshuffle al timeline: la tarjeta frontal pasa atrás,
 * la trasera recibe una imagen nueva y entra al frente.
 */
function addShuffleCycle(
  tl: gsap.core.Timeline,
  cards: HTMLElement[],
  presets: StackPreset[],
  visibleCount: number,
  state: { assignment: number[]; imageCursor: number },
) {
  const label = `cycle-${state.imageCursor}`;
  const recycledIdx = state.assignment[visibleCount - 1];
  const recycledCard = cards[recycledIdx];
  const nextSrc = ALL_IMAGES[state.imageCursor % ALL_IMAGES.length];
  state.imageCursor += 1;

  // Hold antes del cambio.
  tl.to({}, { duration: HOLD_DUR });

  tl.addLabel(label);

  // Cada tarjeta avanza una posición hacia atrás en el stack.
  for (let pos = 0; pos < visibleCount - 1; pos++) {
    const cardIdx = state.assignment[pos];
    const target = presets[pos + 1];
    tl.to(
      cards[cardIdx],
      {
        x: target.x,
        y: target.y,
        rotation: target.rotate,
        scale: target.scale,
        zIndex: target.zIndex,
        duration: SHUFFLE_DUR,
        ease: "power2.inOut",
      },
      label,
    );
  }

  // La tarjeta trasera sale.
  const backPreset = presets[visibleCount - 1];
  tl.to(
    recycledCard,
    {
      opacity: 0,
      x: backPreset.x + 24,
      y: backPreset.y - 18,
      scale: backPreset.scale * 0.94,
      duration: SHUFFLE_DUR * 0.92,
      ease: "power2.in",
    },
    label,
  );

  // Recicla la tarjeta que salió: nueva imagen, entra al frente.
  tl.call(() => setCardImage(recycledCard, nextSrc), undefined, `${label}+=${SHUFFLE_DUR * 0.28}`);

  const front = presets[0];
  const enterRotate = recycledIdx % 2 === 0 ? 4 : -4;

  tl.set(
    recycledCard,
    {
      x: front.x,
      y: front.y + 26,
      rotation: enterRotate,
      scale: 0.96,
      zIndex: front.zIndex + 2,
      opacity: 0,
    },
    `${label}+=${SHUFFLE_DUR * 0.3}`,
  );

  tl.to(
    recycledCard,
    {
      opacity: 1,
      y: front.y,
      rotation: front.rotate,
      scale: front.scale,
      zIndex: front.zIndex,
      duration: ENTER_DUR,
      ease: "power4.out",
    },
    `${label}+=${SHUFFLE_DUR * 0.32}`,
  );

  // Rotar asignaciones: la tarjeta reciclada pasa al frente.
  state.assignment = [
    recycledIdx,
    ...state.assignment.slice(0, visibleCount - 1),
  ];
}

/** Construye el timeline del stack de tarjetas (sin intro, arranca al montar). */
function buildCardStackTimeline(
  root: HTMLDivElement,
  cards: HTMLElement[],
  presets: StackPreset[],
  visibleCount: number,
): gsap.core.Timeline {
  const activeCards = cards.slice(0, visibleCount);

  // Ocultar tarjetas sobrantes (mobile/tablet usan menos de 5).
  cards.slice(visibleCount).forEach((card) => {
    gsap.set(card, { autoAlpha: 0, pointerEvents: "none" });
  });

  // Estado inicial: llenar el stack con las primeras N imágenes.
  const state = {
    assignment: activeCards.map((_, i) => i),
    imageCursor: visibleCount,
  };

  activeCards.forEach((card, i) => {
    setCardImage(card, ALL_IMAGES[i % ALL_IMAGES.length]);
    applyPreset(card, presets[i], true);
  });

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });

  // Un ciclo por imagen → al terminar la lista, repeat:-1 reinicia el bucle.
  for (let i = 0; i < ALL_IMAGES.length; i++) {
    addShuffleCycle(tl, cards, presets, visibleCount, state);
  }

  return tl;
}

export function HeroCinematic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mmRef = useRef<gsap.MatchMedia | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.dataset.heroIntro = "done";
    document.body.dataset.heroFlow = "complete";

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-hero-card]"),
    );
    if (!cards.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const ctx = gsap.context(() => {}, root);

    const start = async () => {
      await waitForSiteReveal();
      if (cancelled) return;

      if (reduceMotion) {
        setCardImage(cards[0], ALL_IMAGES[0]);
        applyPreset(cards[0], DESKTOP_PRESETS[0], true);
        cards.slice(1).forEach((c) => gsap.set(c, { autoAlpha: 0 }));
        return;
      }

      await Promise.all(ALL_IMAGES.map(preloadImage));
      if (cancelled) return;

      ctx.add(() => {
        try {
          const mm = gsap.matchMedia();
          mmRef.current = mm;

          mm.add("(min-width: 901px)", () => {
            const stackTl = buildCardStackTimeline(root, cards, DESKTOP_PRESETS, 5);
            timelineRef.current = stackTl;
            if (!heroVisible) stackTl.pause();
            return () => {
              stackTl.kill();
              if (timelineRef.current === stackTl) timelineRef.current = null;
            };
          });

          mm.add("(min-width: 769px) and (max-width: 900px)", () => {
            const stackTl = buildCardStackTimeline(root, cards, TABLET_PRESETS, 4);
            timelineRef.current = stackTl;
            if (!heroVisible) stackTl.pause();
            return () => {
              stackTl.kill();
              if (timelineRef.current === stackTl) timelineRef.current = null;
            };
          });

          mm.add("(max-width: 768px)", () => {
            const stackTl = buildCardStackTimeline(root, cards, MOBILE_PRESETS, 3);
            timelineRef.current = stackTl;
            if (!heroVisible) stackTl.pause();
            return () => {
              stackTl.kill();
              if (timelineRef.current === stackTl) timelineRef.current = null;
            };
          });
        } catch (err) {
          console.error("[HeroCinematic] card stack failed — static fallback", err);
          setCardImage(cards[0], ALL_IMAGES[0]);
          applyPreset(cards[0], DESKTOP_PRESETS[0], true);
          cards.slice(1).forEach((c) => gsap.set(c, { autoAlpha: 0 }));
        }
      });
    };

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
      mmRef.current?.revert();
      mmRef.current = null;
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Stack de tarjetas editoriales — arranca directamente, sin intro. */}
      <div className={styles.stage}>
        <div className={styles.cardStack}>
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <div key={i} className={styles.card} data-hero-card>
              <img className={styles.cardImage} alt="" decoding="async" />
            </div>
          ))}
        </div>
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
