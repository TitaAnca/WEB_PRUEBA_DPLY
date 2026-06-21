"use client";

import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";
import { useEffect, useRef, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import {
  LAYER_POOL_SIZE,
  animateBlockExit,
  animateFirstImage,
  animatePushPullTransition,
  getFinalBias,
  getPushPullMetrics,
  getEffectiveSizeFactor,
  holdForRole,
  incomingFromRight,
  resetLayerCard,
  resolveConsecutiveSizeFactor,
  type ImageSizeMeta,
  type LayoutCategory,
  type LayoutMode,
  type Orientation,
  type SizeFactor,
  type TransitionKey,
} from "./heroOffsetAnimation";
import { addWordLedComposition } from "./heroSeparatorAnimation";
import {
  HERO_SEPARATOR_PHRASES,
  SEPARATOR_TONE_COLORS,
  type SeparatorPhraseDef,
  type SeparatorTone,
} from "./heroSeparators.config";
import styles from "./HeroCinematic.module.css";

/* ============================================================
   ETECÉ · Hero editorial — EDITORIAL PUSH–PULL
   Dos capas visibles (main + underlayer). La entrada empuja la
   composición; la capa anterior reacciona y cede el protagonismo.

   El separador tipográfico usa escritura letra a letra con énfasis rojo sutil.
   ============================================================ */

type SizeRole = "small" | "medium" | "large" | "featured";

type HeroImageEntry = {
  src: string;
  sizeRole: SizeRole;
  sizeFactor: SizeFactor;
};

type HeroBlock = {
  id: string;
  images: HeroImageEntry[];
  transition: TransitionKey;
};

const img = (src: string, sizeRole: SizeRole, sizeFactor: SizeFactor): HeroImageEntry => ({
  src,
  sizeRole,
  sizeFactor,
});

const HERO_BLOCKS: HeroBlock[] = [
  {
    id: "block-01",
    images: [
      img("/assets/Block01/hero00.jfif", "medium", 0.94),
      img("/assets/Block01/hero01.png", "large", 0.84),
      img("/assets/Block01/hero02.png", "small", 1.06),
      img("/assets/Block01/hero03.png", "featured", 0.78),
      img("/assets/Block01/hero04.png", "medium", 1),
      img("/assets/Block01/hero05.png", "small", 0.89),
      img("/assets/Block01/hero06.png", "large", 1.11),
      img("/assets/Block01/hero07.png", "medium", 0.94),
    ],
    transition: "t1",
  },
  {
    id: "block-02",
    images: [
      img("/assets/Block02/hero08.png", "large", 1.06),
      img("/assets/Block02/hero09.png", "medium", 0.89),
      img("/assets/Block02/hero10.png", "small", 0.78),
      img("/assets/Block02/hero11.png", "medium", 1),
      img("/assets/Block02/hero12.png", "featured", 0.84),
      img("/assets/Block02/hero13.png", "small", 1.11),
      img("/assets/Block02/hero14.jfif", "large", 0.94),
      img("/assets/Block02/hero15.png", "medium", 0.78),
    ],
    transition: "t2",
  },
  {
    id: "block-03",
    images: [
      img("/assets/Block03/hero16.png", "medium", 0.89),
      img("/assets/Block03/hero17.png", "large", 1.11),
      img("/assets/Block03/hero18.jfif", "small", 0.84),
      img("/assets/Block03/hero19.png", "featured", 0.78),
      img("/assets/Block03/hero20.png", "medium", 1.06),
      img("/assets/Block03/hero21.png", "small", 0.94),
      img("/assets/Block03/hero22.png", "large", 1),
      img("/assets/Block03/hero23.png", "medium", 0.84),
    ],
    transition: "t3",
  },
  {
    id: "block-04",
    images: [
      img("/assets/Block04/hero24.png", "large", 1),
      img("/assets/Block04/hero25.png", "small", 0.78),
      img("/assets/Block04/hero26.png", "medium", 0.94),
      img("/assets/Block04/hero27.png", "large", 1.06),
      img("/assets/Block04/hero28.png", "featured", 0.84),
      img("/assets/Block04/hero29.png", "medium", 0.89),
      img("/assets/Block04/hero30.png", "small", 1.11),
      img("/assets/Block04/hero31.png", "large", 0.94),
    ],
    transition: "t4",
  },
  {
    id: "block-05",
    images: [
      img("/assets/Block05/hero32.png", "medium", 0.84),
      img("/assets/Block05/hero33.png", "small", 0.89),
      img("/assets/Block05/hero34.png", "large", 1.06),
      img("/assets/Block05/hero35.png", "medium", 0.94),
      img("/assets/Block05/hero36.png", "featured", 0.78),
      img("/assets/Block05/hero37.png", "small", 1.11),
      img("/assets/Block05/hero38.png", "large", 1),
      img("/assets/Block05/hero39.png", "medium", 0.84),
    ],
    transition: "t5",
  },
  {
    id: "block-06",
    images: [
      img("/assets/Block06/hero40.png", "large", 1.11),
      img("/assets/Block06/hero41.png", "medium", 0.94),
      img("/assets/Block06/hero42.png", "small", 0.78),
      img("/assets/Block06/hero43.png", "large", 1.06),
      img("/assets/Block06/hero44.png", "featured", 0.84),
      img("/assets/Block06/hero45.png", "medium", 0.89),
      img("/assets/Block06/hero46.png", "small", 1),
      img("/assets/Block06/hero47.png", "large", 0.78),
    ],
    transition: "final",
  },
];

const ALL_IMAGES: string[] = HERO_BLOCKS.flatMap((b) => b.images.map((e) => e.src));

const SIZE_ROLE_CLASS: Record<SizeRole, string> = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
  featured: styles.sizeFeatured,
};

const ALL_SIZE_ROLE_CLASSES = Object.values(SIZE_ROLE_CLASS);

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

const preloadImage = (src: string): Promise<void> =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

type Card = {
  el: HTMLElement;
  base: HTMLImageElement;
};

type LayerSlots = {
  main: Card;
  under: Card;
  spare: Card;
  hasUnder: boolean;
};

const PHRASE_LENGTH_CLASS = {
  short: styles.phraseShort,
  medium: styles.phraseMedium,
  long: styles.phraseLong,
} as const;

function SeparatorCharacter({
  char,
  tone,
  isWordEnd,
}: {
  char: string;
  tone: SeparatorTone;
  isWordEnd: boolean;
}) {
  const colors = SEPARATOR_TONE_COLORS[tone];
  return (
    <span
      className={styles.separatorChar}
      data-schar
      data-tone={tone}
      data-word-end={isWordEnd ? "true" : undefined}
      aria-hidden="true"
      style={{ color: colors.start }}
    >
      {char}
    </span>
  );
}

function SeparatorWord({ text, tone }: { text: string; tone: SeparatorTone }) {
  const chars = Array.from(text);
  return (
    <span className={styles.separatorWord} data-sword>
      {chars.map((ch, i) => (
        <SeparatorCharacter key={`${i}-${ch}`} char={ch} tone={tone} isWordEnd={i === chars.length - 1} />
      ))}
    </span>
  );
}

function ConfiguredSeparatorPhrase({ phrase }: { phrase: SeparatorPhraseDef }) {
  const lengthClass = PHRASE_LENGTH_CLASS[phrase.length];
  const phraseModifier = phrase.phraseClass ? styles[phrase.phraseClass as keyof typeof styles] : "";

  return (
    <div className={styles.separatorStage}>
      <div
        className={`${styles.separatorPhrase} ${lengthClass} ${phraseModifier}`}
        data-separator-phrase
        aria-label={phrase.ariaLabel}
      >
        {phrase.words.map((word, wi) => (
          <SeparatorWord key={`${wi}-${word.text}`} text={word.text} tone={word.tone} />
        ))}
      </div>
    </div>
  );
}

function getOrientationFromCard(card: HTMLElement): Orientation {
  if (card.classList.contains(styles.landscape)) return "landscape";
  if (card.classList.contains(styles.portrait)) return "portrait";
  return "square";
}

const getLayout = (): LayoutMode => {
  const w = typeof window === "undefined" ? 1280 : window.innerWidth;
  if (w <= 768) return { category: "mobile", radius: 16 };
  if (w <= 1024) return { category: "tablet", radius: 22 };
  return { category: "desktop", radius: 22 };
};

function applySizeRole(card: HTMLElement, sizeRole: SizeRole) {
  card.classList.remove(...ALL_SIZE_ROLE_CLASSES);
  card.classList.add(SIZE_ROLE_CLASS[sizeRole]);
}

function applyImageSizing(
  card: HTMLElement,
  entry: HeroImageEntry,
  effectiveFactor: SizeFactor,
  category: LayoutCategory,
) {
  applySizeRole(card, entry.sizeRole);
  card.style.setProperty(
    "--size-factor",
    String(getEffectiveSizeFactor(effectiveFactor, category)),
  );
}

function prepareCard(
  card: Card,
  entry: HeroImageEntry,
  effectiveFactor: SizeFactor,
  category: LayoutCategory,
) {
  if (card.base.getAttribute("src") !== entry.src) card.base.src = entry.src;
  applyImageSizing(card.el, entry, effectiveFactor, category);
  if (card.base.complete && card.base.naturalWidth) applyOrientation(card.base);
}

function initLayerSlots(cards: Card[]): LayerSlots {
  return {
    main: cards[0],
    under: cards[1],
    spare: cards[2],
    hasUnder: false,
  };
}

function rotateLayerSlots(slots: LayerSlots): LayerSlots {
  return {
    main: slots.spare,
    under: slots.main,
    spare: slots.under,
    hasUnder: true,
  };
}

function resolveEntryOrientation(card: Card, fallback: Orientation): Orientation {
  if (card.base.complete && card.base.naturalWidth) {
    return getOrientationFromCard(card.el);
  }
  return fallback;
}

function addPushPullStep(
  tl: gsap.core.Timeline,
  slots: LayerSlots,
  imageIndex: number,
  entry: HeroImageEntry,
  mode: LayoutMode,
) {
  const metrics = getPushPullMetrics(mode.category);
  const bias = getFinalBias(imageIndex, metrics);
  const fromRight = incomingFromRight(imageIndex);

  if (imageIndex === 0) {
    animateFirstImage(tl, slots.main.el, {
      x: bias.x,
      y: bias.y,
      r: mode.radius,
    });
    tl.to({}, { duration: holdForRole(entry.sizeRole) });
    return;
  }

  const hasOutgoing = imageIndex >= 2;

  animatePushPullTransition(tl, {
    incoming: slots.spare.el,
    main: slots.main.el,
    outgoing: hasOutgoing ? slots.under.el : null,
    fromRight,
    metrics,
    finalX: bias.x,
    finalY: bias.y,
    incomingScale: 1,
    r: mode.radius,
    hasOutgoing,
  });

  tl.to({}, { duration: holdForRole(entry.sizeRole) });
}

function buildHeroTimeline(root: HTMLDivElement, mode: LayoutMode): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const cardEls = q<HTMLElement>("[data-card]");
  const cards: Card[] = cardEls
    .map((el) => {
      const base = el.querySelector<HTMLImageElement>("[data-base]");
      if (!base) return null;
      return { el, base };
    })
    .filter((c): c is Card => c !== null);

  if (cards.length < LAYER_POOL_SIZE) {
    return gsap.timeline();
  }

  const transitions = new Map<TransitionKey, HTMLElement>();
  (["t1", "t2", "t3", "t4", "t5", "final"] as TransitionKey[]).forEach((key) => {
    const el = q<HTMLElement>(`[data-transition="${key}"]`)[0];
    if (el) transitions.set(key, el);
  });

  cards.forEach((c) => resetLayerCard(c.el));
  transitions.forEach((el) => gsap.set(el, { autoAlpha: 0, visibility: "hidden" }));

  const master = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
  const metrics = getPushPullMetrics(mode.category);
  let skipFirstImageEnter = false;

  HERO_BLOCKS.forEach((block, blockIndex) => {
    const nextBlock = HERO_BLOCKS[(blockIndex + 1) % HERO_BLOCKS.length];
    let slots = initLayerSlots(cards);
    let prevMeta: ImageSizeMeta | null = null;
    let lastFromRight = false;

    master.call(() => {
      slots = initLayerSlots(cards);
      slots.hasUnder = false;
      if (skipFirstImageEnter) {
        resetLayerCard(slots.under.el);
        resetLayerCard(slots.spare.el);
      } else {
        cards.forEach((c) => resetLayerCard(c.el));
      }
    });

    block.images.forEach((entry, imageIndex) => {
      const targetCard = imageIndex === 0 ? slots.main : slots.spare;
      const orient = resolveEntryOrientation(targetCard, prevMeta?.orientation ?? "landscape");
      const effectiveFactor = resolveConsecutiveSizeFactor(
        prevMeta,
        entry,
        orient,
        mode.category,
      );

      master.call(() => prepareCard(targetCard, entry, effectiveFactor, mode.category));

      if (imageIndex === 0 && skipFirstImageEnter) {
        skipFirstImageEnter = false;
        master.to({}, { duration: holdForRole(entry.sizeRole) });
      } else {
        addPushPullStep(master, slots, imageIndex, entry, mode);
      }

      const settledOrient =
        imageIndex === 0
          ? getOrientationFromCard(slots.main.el)
          : resolveEntryOrientation(slots.spare, orient);
      prevMeta = {
        sizeRole: entry.sizeRole,
        orientation: settledOrient,
        sizeFactor: effectiveFactor,
      };
      lastFromRight = incomingFromRight(imageIndex);

      if (imageIndex > 0) {
        slots = rotateLayerSlots(slots);
        slots.hasUnder = true;
      }
    });

    const exitMain = slots.main.el;
    const exitUnder = slots.hasUnder ? slots.under.el : null;
    const exitHadUnder = slots.hasUnder;
    const exitFromRight = lastFromRight;

    const exitLabel = animateBlockExit(master, exitMain, exitUnder, {
      lastFromRight: exitFromRight,
      metrics,
      hadUnder: exitHadUnder,
    });

    const tEl = transitions.get(block.transition);
    if (tEl) {
      const nextEntry = nextBlock.images[0];
      const handoffMeta = prevMeta as ImageSizeMeta | null;
      const nextOrient = resolveEntryOrientation(
        cards[0],
        handoffMeta?.orientation ?? "landscape",
      );
      const nextFactor = resolveConsecutiveSizeFactor(
        handoffMeta,
        nextEntry,
        nextOrient,
        mode.category,
      );
      const nextBias = getFinalBias(0, metrics);

      addWordLedComposition(
        master,
        tEl,
        block.transition,
        {
          enterAt: `${exitLabel}+=0.15`,
          onPrepareNextImage: () => {
            prepareCard(cards[0], nextEntry, nextFactor, mode.category);
          },
          nextImage: {
            el: cards[0].el,
            x: nextBias.x,
            y: nextBias.y,
            r: mode.radius,
          },
          onHandoffComplete: () => {
            skipFirstImageEnter = true;
          },
        },
        mode.category,
      );
    }
  });

  return master;
}

const TRANSITIONS: { key: TransitionKey; render: () => ReactNode }[] = HERO_SEPARATOR_PHRASES.map(
  (phrase) => ({
    key: phrase.transitionKey,
    render: () => (
      <div className={styles.transition} data-transition={phrase.transitionKey}>
        <ConfiguredSeparatorPhrase phrase={phrase} />
      </div>
    ),
  }),
);

function applyOrientation(imgEl: HTMLImageElement) {
  const card = imgEl.parentElement;
  if (!card) return;
  card.classList.remove(styles.landscape, styles.portrait, styles.square);
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  if (!w || !h) return;
  const ratio = w / h;
  card.classList.add(ratio > 1.15 ? styles.landscape : ratio < 0.87 ? styles.portrait : styles.square);
}

function applyImageMeta(imgEl: HTMLImageElement, entry?: HeroImageEntry, category: LayoutCategory = "desktop") {
  const card = imgEl.parentElement;
  if (!card) return;
  if (entry) {
    applyImageSizing(card, entry, entry.sizeFactor, category);
  }
  applyOrientation(imgEl);
}

export function HeroCinematic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const onImgLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const card = e.currentTarget.parentElement;
    const layer = card?.getAttribute("data-layer");
    const entry =
      layer === "main" ? HERO_BLOCKS[0].images[0] : undefined;
    applyImageMeta(e.currentTarget, entry);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.dataset.heroIntro = "done";
    document.body.dataset.heroFlow = "complete";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialImages = Array.from(
      new Set([
        ...HERO_BLOCKS[0].images.map((e) => e.src),
        ...HERO_BLOCKS[1].images.slice(0, 3).map((e) => e.src),
      ]),
    );

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    let heroVisible = true;
    let builtCategory: LayoutCategory | null = null;
    const ctx = gsap.context(() => {}, root);

    const placeStatic = (reveal: boolean) => {
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
      const entry = HERO_BLOCKS[0].images[0];
      els.forEach((el, k) => {
        const base = el.querySelector<HTMLImageElement>("[data-base]");
        if (k === 0 && base && entry) {
          if (!base.getAttribute("src")) base.src = entry.src;
          applyImageSizing(el, entry, entry.sizeFactor, getLayout().category);
          if (base.complete && base.naturalWidth) applyOrientation(base);
          gsap.set(el, {
            autoAlpha: reveal ? 1 : 0,
            visibility: reveal ? "visible" : "hidden",
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: 20,
            clipPath: "none",
          });
          return;
        }
        resetLayerCard(el);
      });
    };

    placeStatic(true);

    const buildForCurrentLayout = () => {
      const mode = getLayout();
      builtCategory = mode.category;
      placeStatic(false);
      ctx.add(() => {
        try {
          tl?.kill();
          tl = buildHeroTimeline(root, mode);
          timelineRef.current = tl;
          tl.play();
          if (!heroVisible && tl.time() > 1) tl.pause();
        } catch (err) {
          console.error("[HeroCinematic] timeline failed — using static fallback", err);
          placeStatic(true);
        }
      });
    };

    const start = async () => {
      await waitForSiteReveal();
      if (cancelled) return;

      if (reduceMotion) {
        placeStatic(true);
        return;
      }

      await Promise.all(initialImages.map(preloadImage));
      if (cancelled) return;
      buildForCurrentLayout();
      ALL_IMAGES.forEach((src) => {
        void preloadImage(src);
      });
    };

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
      <div className={styles.stage}>
        <div className={styles.cardStack}>
          {Array.from({ length: LAYER_POOL_SIZE }).map((_, i) => {
            const entry = HERO_BLOCKS[0].images[0];
            const layerRole = i === 0 ? "main" : i === 1 ? "under" : "spare";
            return (
              <div
                className={`${styles.card} ${SIZE_ROLE_CLASS[entry.sizeRole]}`}
                data-card
                data-layer={layerRole}
                key={`push-pull-${layerRole}`}
                style={{ "--size-factor": entry.sizeFactor } as CSSProperties}
              >
                <img
                  className={styles.base}
                  data-base
                  alt=""
                  decoding="async"
                  onLoad={onImgLoad}
                  src={i === 0 ? entry.src : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.transitionsLayer}>
        {TRANSITIONS.map((t) => (
          <div key={t.key}>{t.render()}</div>
        ))}
      </div>

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
