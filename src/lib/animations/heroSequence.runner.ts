"use client";

import {
  HERO_BLOCK_IDS,
  HERO_CLOSING_CROSSFADE_MS,
  HERO_CLOSING_MS,
  HERO_CROSSFADE_MS,
  HERO_FRAME_EXTS,
  HERO_FRAME_MS,
  HERO_PEAK_FRAME_MS,
  HERO_STATEMENT_CROSSFADE_MS,
  HERO_STATEMENT_MS,
  HERO_STATEMENT_PHRASES,
} from "@/content/heroSequence.config";
import { gsap } from "@/lib/gsap/gsapClient";

const pad2 = (n: number) => String(n).padStart(2, "0");

function tryLoad(src: string, timeoutMs = 450): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const t = window.setTimeout(() => resolve(false), timeoutMs);
    img.decoding = "async";
    img.onload = () => {
      window.clearTimeout(t);
      resolve(true);
    };
    img.onerror = () => {
      window.clearTimeout(t);
      resolve(false);
    };
    img.src = src;
  });
}

async function resolveFirstExisting(candidates: string[]): Promise<string | null> {
  for (const src of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await tryLoad(src);
    if (ok) return src;
  }
  return null;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    gsap.delayedCall(Math.max(0, ms) / 1000, resolve);
  });
}

type FrameKind = "hero" | "hero-peak" | "statement" | "closing";

type FrameStep = {
  src: string | null;
  ms: number;
  kind: FrameKind;
  blockIndex: number;
  phrase?: string;
};

function preloadImage(src: string | null): Promise<boolean> {
  if (!src) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

const imageMetaCache = new Map<string, Promise<FrameMeta>>();
const sceneMotionTweens = new WeakMap<HTMLElement, gsap.core.Tween[]>();
type MotionProfile = {
  statementY: number;
  statementScale: number;
  closingDotY: number;
  closingStagger: number;
  typeStrokeTravel: number;
  crossfadeScale: number;
};

function clearSceneMotion(sceneEl: HTMLElement) {
  const tweens = sceneMotionTweens.get(sceneEl);
  if (tweens?.length) {
    tweens.forEach((t) => t.kill());
  }
  sceneMotionTweens.delete(sceneEl);
}

function animateAmbientSceneMotion(sceneEl: HTMLElement, isMobile: boolean) {
  const fill = sceneEl.querySelector(".hero-scene-fill");
  const left = sceneEl.querySelector(".hero-scene-fragment--left");
  const right = sceneEl.querySelector(".hero-scene-fragment--right");
  const main = sceneEl.querySelector(".hero-scene-main");
  const focus = sceneEl.querySelector(".hero-scene-focus");
  const duoA = sceneEl.querySelector(".hero-scene-duo-img--a");
  const duoB = sceneEl.querySelector(".hero-scene-duo-img--b");
  const durA = isMobile ? 9.4 : 13.6;
  const durB = isMobile ? 9 : 12.8;

  const addYoyo = (el: Element | null, vars: gsap.TweenVars) => {
    if (!el) return null;
    return gsap.to(el, { ...vars, repeat: -1, yoyo: true, ease: "sine.inOut" });
  };

  const tweens = [
    addYoyo(fill, { xPercent: 0.1, yPercent: -0.1, scale: 1.01, duration: durB }),
    addYoyo(left, { xPercent: -0.24, yPercent: 0.14, scale: 1.008, duration: durB }),
    addYoyo(right, { xPercent: 0.24, yPercent: -0.14, scale: 1.008, duration: durB }),
    addYoyo(main, { yPercent: -50.14, scale: 1.008, duration: durA }),
    addYoyo(focus, { xPercent: -50.06, yPercent: -49.92, scale: 1.012, duration: durA }),
    addYoyo(duoA, { xPercent: 0.18, y: 1, scale: 0.998, duration: durA }),
    addYoyo(duoB, { xPercent: -0.18, y: 1, scale: 0.996, duration: durA }),
  ].filter(Boolean) as gsap.core.Tween[];
  return tweens;
}

function animateSceneMotion(
  sceneEl: HTMLElement,
  opts: { isStatement: boolean; isClosing: boolean; isTypographic: boolean },
  profile: MotionProfile,
  isMobile: boolean
) {
  clearSceneMotion(sceneEl);
  const tweens: gsap.core.Tween[] = [];

  if (opts.isStatement) {
    tweens.push(
      gsap.fromTo(sceneEl, { scale: profile.statementScale, filter: "blur(2px)" }, { scale: 1, filter: "blur(0px)", duration: 0.82, ease: "power3.out" })
    );
    const words = Array.from(sceneEl.querySelectorAll(".statement-word"));
    if (words.length) {
      tweens.push(
        gsap.fromTo(
          words,
          { y: profile.statementY, scale: 0.988, letterSpacing: "0.078em", opacity: 0, clipPath: "inset(0 100% 0 0)" },
          {
            y: 0,
            scale: 1,
            letterSpacing: "0.058em",
            opacity: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 1.18,
            ease: "power3.out",
            stagger: 0.15,
            delay: 0.22,
          }
        )
      );
    }
  } else if (opts.isClosing) {
    const dots = Array.from(sceneEl.querySelectorAll(".hero-scene-closing-dot"));
    if (dots.length) {
      tweens.push(
        gsap.fromTo(dots, { opacity: 0, y: profile.closingDotY }, { opacity: 1, y: 0, duration: 0.52, ease: "power3.out", stagger: profile.closingStagger, delay: 0.22 })
      );
    }
  } else if (opts.isTypographic) {
    const layers = Array.from(sceneEl.querySelectorAll(".hero-scene-type-layer"));
    const stroke = sceneEl.querySelector(".hero-scene-type-stroke");
    if (layers.length) {
      tweens.push(
        gsap.fromTo(
          layers,
          { scaleX: 0, opacity: 0, transformOrigin: "50% 50%" },
          { scaleX: 1, opacity: 1, duration: 0.98, ease: "power3.out", stagger: 0.17 }
        )
      );
    }
    if (stroke) {
      tweens.push(
        gsap.fromTo(stroke, { xPercent: -profile.typeStrokeTravel, opacity: 0 }, { xPercent: profile.typeStrokeTravel, opacity: 0, duration: 0.92, delay: 0.12, ease: "power3.out" })
      );
    }
  } else {
    tweens.push(...animateAmbientSceneMotion(sceneEl, isMobile));
  }

  sceneMotionTweens.set(sceneEl, tweens);
}

type FrameMeta = {
  isDark: boolean;
  aspectRatio: number;
  dominantColor: { r: number; g: number; b: number };
};

async function getFrameMeta(src: string): Promise<FrameMeta> {
  if (imageMetaCache.has(src)) return imageMetaCache.get(src)!;
  const p = new Promise<FrameMeta>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve({
          isDark: false,
          aspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
          dominantColor: { r: 18, g: 18, b: 18 },
        });
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let lum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      const pxCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        lum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        rSum += r;
        gSum += g;
        bSum += b;
      }
      const avgLum = lum / pxCount;
      resolve({
        isDark: avgLum < 62,
        aspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
        dominantColor: {
          r: Math.round(rSum / pxCount),
          g: Math.round(gSum / pxCount),
          b: Math.round(bSum / pxCount),
        },
      });
    };
    img.onerror = () =>
      resolve({
        isDark: false,
        aspectRatio: 16 / 9,
        dominantColor: { r: 18, g: 18, b: 18 },
      });
    img.src = src;
  });
  imageMetaCache.set(src, p);
  return p;
}

function setSceneImage(
  sceneEl: HTMLElement,
  src: string | null,
  secondarySrc: string | null,
  isStatement: boolean,
  phrase: string,
  isPeak: boolean,
  isTypographic: boolean,
  isReconstructed: boolean,
  useTonalFit: boolean,
  useDuo: boolean,
  frameMeta: FrameMeta | null,
  blockIndex: number
) {
  const fill = sceneEl.querySelector(".hero-scene-fill");
  const fragLeft = sceneEl.querySelector(".hero-scene-fragment--left");
  const fragRight = sceneEl.querySelector(".hero-scene-fragment--right");
  const focus = sceneEl.querySelector(".hero-scene-focus");
  const typeLayers = sceneEl.querySelectorAll(".hero-scene-type-layer");
  const statement = sceneEl.querySelector(".hero-scene-statement");
  const closing = sceneEl.querySelector(".hero-scene-closing");
  const duoA = sceneEl.querySelector(".hero-scene-duo-img--a");
  const duoB = sceneEl.querySelector(".hero-scene-duo-img--b");
  const main = sceneEl.querySelector(".hero-scene-main");
  if (!fill || !fragLeft || !fragRight || !focus || !main || !statement || !closing || !duoA || !duoB) return;

  const fragL = fragLeft as HTMLElement;
  const fragR = fragRight as HTMLElement;
  const foc = focus as HTMLElement;
  const stmt = statement as HTMLElement;
  const cls = closing as HTMLElement;
  const mainImg = main as HTMLImageElement;
  const da = duoA as HTMLImageElement;
  const db = duoB as HTMLImageElement;
  const fillEl = fill as HTMLElement;

  if (isStatement) {
    const words = (phrase || "").split(/\s+/).filter(Boolean);
    const isThreeWordLine = words.length === 3 && words.join(" ") === "EMPIEZA EVOLUCIONA ESCALA";
    stmt.classList.toggle("statement-single-line", isThreeWordLine);
    stmt.innerHTML = words
      .map((word, index) => {
        const accent = word === "TODO" || word === "RUIDO" || word === "EVOLUCIONA";
        return `<span class="statement-word${accent ? " statement-word--accent" : ""}" style="--word-index:${index};">${word}</span>`;
      })
      .join("");
  } else {
    stmt.classList.remove("statement-single-line");
    stmt.innerHTML = "";
    if (src) {
      const imageUrl = `url("${src}")`;
      fragL.style.backgroundImage = imageUrl;
      fragR.style.backgroundImage = imageUrl;
      foc.style.backgroundImage = imageUrl;
      typeLayers.forEach((el) => {
        (el as HTMLElement).style.backgroundImage = imageUrl;
      });
      mainImg.src = src;
      da.src = src;
      db.src = secondarySrc || src;
    }
  }

  const focalMap = [
    { x: "52%", y: "46%" },
    { x: "50%", y: "42%" },
    { x: "48%", y: "50%" },
    { x: "55%", y: "48%" },
    { x: "47%", y: "44%" },
    { x: "51%", y: "47%" },
  ];
  const focal = focalMap[blockIndex % focalMap.length];
  sceneEl.style.setProperty("--peak-focus-x", focal.x);
  sceneEl.style.setProperty("--peak-focus-y", focal.y);
  sceneEl.style.setProperty("--left-crop-x", `${18 + (blockIndex % 3) * 8}%`);
  sceneEl.style.setProperty("--right-crop-x", `${82 - (blockIndex % 3) * 7}%`);
  sceneEl.classList.remove("motion-0", "motion-1", "motion-2");
  sceneEl.classList.add(`motion-${blockIndex % 3}`);

  const palette = [
    { bgA: "#060606", bgB: "#111111", line: "rgba(255,255,255,0.08)" },
    { bgA: "#05080d", bgB: "#151a20", line: "rgba(236,0,0,0.14)" },
    { bgA: "#070707", bgB: "#191919", line: "rgba(255,255,255,0.07)" },
    { bgA: "#05070a", bgB: "#12161c", line: "rgba(236,0,0,0.12)" },
    { bgA: "#060606", bgB: "#171717", line: "rgba(255,255,255,0.09)" },
    { bgA: "#040608", bgB: "#141920", line: "rgba(236,0,0,0.1)" },
  ];
  const tone = palette[blockIndex % palette.length];
  fillEl.style.setProperty("--scene-bg-a", tone.bgA);
  fillEl.style.setProperty("--scene-bg-b", tone.bgB);
  fillEl.style.setProperty("--scene-line", tone.line);
  if (frameMeta && frameMeta.dominantColor) {
    const { r, g, b } = frameMeta.dominantColor;
    fillEl.style.setProperty("--tone-bg", `rgb(${r}, ${g}, ${b})`);
    fillEl.style.setProperty("--tone-bg-deep", `rgb(${Math.max(0, r - 18)}, ${Math.max(0, g - 18)}, ${Math.max(0, b - 18)})`);
  }

  sceneEl.classList.toggle("is-statement", isStatement);
  sceneEl.classList.toggle("is-closing", phrase === "__CLOSING__");
  sceneEl.classList.toggle("is-peak", isPeak);
  sceneEl.classList.toggle("is-reconstructed", isReconstructed);
  sceneEl.classList.toggle("is-tonal-fit", useTonalFit);
  sceneEl.classList.toggle("is-duo", useDuo);
  sceneEl.classList.remove("is-typographic");
  if (isTypographic) {
    sceneEl.classList.add("is-typographic");
  }
}

async function resolveHeroFrameFromBlock(blockId: string, frameNumber: number): Promise<string | null> {
  const candidates = HERO_FRAME_EXTS.map((ext) => `/assets/${blockId}/hero${pad2(frameNumber)}.${ext}`);
  return resolveFirstExisting(candidates as unknown as string[]);
}

export type RunHeroSequenceOptions = {
  signal?: AbortSignal;
};

/**
 * Crossfaded hero image sequence (legacy behavior), runs after intro.
 */
export async function runHeroImageSequence(options: RunHeroSequenceOptions = {}): Promise<void> {
  const { signal } = options;
  const sceneA = document.querySelector(".hero-scene-a") as HTMLElement | null;
  const sceneB = document.querySelector(".hero-scene-b") as HTMLElement | null;
  const hero = document.querySelector(".landing-block--hero") as HTMLElement | null;
  if (!hero || !sceneA || !sceneB) return;
  const mm = gsap.matchMedia();
  let profile: MotionProfile = {
    statementY: 16,
    statementScale: 1.006,
    closingDotY: 6,
    closingStagger: 0.19,
    typeStrokeTravel: 120,
    crossfadeScale: 1.008,
  };
  let isMobile = false;
  mm.add(
    {
      desktop: "(min-width: 820px)",
      tablet: "(min-width: 614px) and (max-width: 819px)",
      mobile: "(max-width: 613px)",
    },
    (context) => {
      if (context.conditions?.mobile) {
        isMobile = true;
        profile = { statementY: 8, statementScale: 1.004, closingDotY: 4, closingStagger: 0.14, typeStrokeTravel: 70, crossfadeScale: 1.004 };
      } else if (context.conditions?.tablet) {
        isMobile = false;
        profile = { statementY: 10, statementScale: 1.005, closingDotY: 4, closingStagger: 0.16, typeStrokeTravel: 83, crossfadeScale: 1.006 };
      } else {
        isMobile = false;
        profile = { statementY: 13, statementScale: 1.006, closingDotY: 5, closingStagger: 0.19, typeStrokeTravel: 96, crossfadeScale: 1.008 };
      }
    }
  );

  const blockIds = [...HERO_BLOCK_IDS];
  const statementPhrases = [...HERO_STATEMENT_PHRASES];
  const frames: FrameStep[] = [];

  for (let blockIndex = 0; blockIndex < blockIds.length; blockIndex++) {
    const blockId = blockIds[blockIndex];
    const heroStart = blockIndex * 8;
    const heroEnd = heroStart + 7;
    for (let frameNumber = heroStart; frameNumber <= heroEnd; frameNumber++) {
      if (signal?.aborted) return;
      // eslint-disable-next-line no-await-in-loop
      const heroSrc = await resolveHeroFrameFromBlock(blockId, frameNumber);
      if (heroSrc) {
        const isPeak = frameNumber === heroEnd;
        frames.push({
          src: heroSrc,
          ms: isPeak ? HERO_PEAK_FRAME_MS : HERO_FRAME_MS,
          kind: isPeak ? "hero-peak" : "hero",
          blockIndex,
        });
      }
    }

    if (blockIndex < statementPhrases.length) {
      frames.push({
        src: null,
        ms: HERO_STATEMENT_MS,
        kind: "statement",
        blockIndex,
        phrase: statementPhrases[blockIndex],
      });
    }
  }
  frames.push({
    src: null,
    ms: HERO_CLOSING_MS,
    kind: "closing",
    blockIndex: blockIds.length,
  });

  if (!frames.length) return;

  let current = sceneA;
  let next = sceneB;
  current.style.opacity = "0";
  current.style.visibility = "hidden";
  next.style.opacity = "0";
  next.style.visibility = "hidden";
  current.style.transitionDuration = "";
  next.style.transitionDuration = "";

  let frameIndex = 0;
  let nextPreloadedSrc: string | null = null;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (signal?.aborted) return;
      const step = frames[frameIndex];
      const upcoming = frames[(frameIndex + 1) % frames.length];
      const target = next;
      const previous = current;
      const previousWasStatement = previous.classList.contains("is-statement");
      const isStatement = step.kind === "statement";
      const isClosing = step.kind === "closing";
      const isPeak = step.kind === "hero-peak";
      let isReconstructed = false;
      let isTypographic = false;
      let useTonalFit = false;
      const useDuo = false;
      let frameMeta: FrameMeta | null = null;
      if (!isStatement && !isClosing && step.src) {
        // eslint-disable-next-line no-await-in-loop
        const meta = await getFrameMeta(step.src);
        frameMeta = meta;
        const viewportAspect = window.innerWidth / Math.max(1, window.innerHeight);
        const aspectDelta = Math.abs(meta.aspectRatio - viewportAspect);
        isReconstructed = isPeak || aspectDelta > 0.2;
        useTonalFit = aspectDelta > 0.2;
        isTypographic = isPeak && meta.isDark;
      }
      const activeCrossfadeMs = isClosing
        ? HERO_CLOSING_CROSSFADE_MS
        : isStatement
          ? HERO_STATEMENT_CROSSFADE_MS
          : HERO_CROSSFADE_MS;

      if (!isStatement && !isClosing && step.src && (!nextPreloadedSrc || nextPreloadedSrc !== step.src)) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await preloadImage(step.src);
        if (!ok) {
          frameIndex = (frameIndex + 1) % frames.length;
          continue;
        }
      }

      setSceneImage(
        target,
        step.src,
        upcoming.src || null,
        isStatement || isClosing,
        isClosing ? "__CLOSING__" : step.phrase || "",
        isPeak,
        isTypographic,
        isReconstructed,
        useTonalFit,
        useDuo,
        frameMeta,
        step.blockIndex || 0
      );

    previous.classList.toggle("to-black-transition", isStatement);
    target.classList.toggle("from-black-transition", previousWasStatement && !isStatement);

    target.style.visibility = "visible";
    gsap.set(target, { opacity: 0 });
    gsap.killTweensOf([target, previous]);
    gsap.to(target, { opacity: 1, duration: activeCrossfadeMs / 1000, ease: "power2.out" });
    gsap.to(previous, {
      opacity: 0,
      duration: activeCrossfadeMs / 1000,
      ease: "power2.out",
      scale: isStatement ? profile.crossfadeScale : 1,
      onComplete: () => {
        previous.style.visibility = "hidden";
        gsap.set(previous, { scale: 1 });
        previous.classList.remove("to-black-transition", "from-black-transition");
      },
    });

    animateSceneMotion(target, { isStatement, isClosing, isTypographic }, profile, isMobile);

    const preloadPromise =
      upcoming.kind === "statement" || upcoming.kind === "closing" || !upcoming.src
        ? Promise.resolve()
        : preloadImage(upcoming.src).then((ok) => {
            nextPreloadedSrc = ok ? upcoming.src : null;
          });

      current = target;
      next = current === sceneA ? sceneB : sceneA;
      frameIndex = (frameIndex + 1) % frames.length;

      // eslint-disable-next-line no-await-in-loop
      await Promise.all([wait(step.ms), preloadPromise]);
      if (isClosing) break;
    }
  } finally {
    clearSceneMotion(sceneA);
    clearSceneMotion(sceneB);
    mm.revert();
  }
}
