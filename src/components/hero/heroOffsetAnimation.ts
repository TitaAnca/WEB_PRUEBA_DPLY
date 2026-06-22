import { gsap } from "@/lib/gsap/gsapClient";

export type TransitionKey = "t1" | "t2" | "t3" | "t4" | "t5" | "final";
export const ALLOWED_SIZE_FACTORS = [0.78, 0.84, 0.89, 0.94, 1, 1.06, 1.11] as const;
export type SizeFactor = (typeof ALLOWED_SIZE_FACTORS)[number];

export type SizeRole = "small" | "medium" | "large" | "featured";
export type LayoutCategory = "mobile" | "tablet" | "desktop";
export type Orientation = "landscape" | "portrait" | "square";

export type ImageSizeMeta = {
  sizeRole: SizeRole;
  orientation: Orientation;
  sizeFactor: SizeFactor;
};

export type LayoutMode = {
  category: LayoutCategory;
  radius: number;
};

export const LAYER_POOL_SIZE = 3;

const HOLD_BY_ROLE: Record<SizeRole, number> = {
  small: 0.42,
  medium: 0.5,
  large: 0.58,
  featured: 0.68,
};

export type PushPullMetrics = {
  incomingOffsetX: number;
  incomingOffsetY: number;
  underlayerOffsetX: number;
  underlayerOffsetY: number;
  underlayerScale: number;
  underlayerOpacity: number;
  biasMaxX: number;
  biasMaxY: number;
  exitPushX: number;
  exitUnderPushX: number;
};

export function getPushPullMetrics(category: LayoutCategory): PushPullMetrics {
  if (category === "mobile") {
    return {
      incomingOffsetX: 9,
      incomingOffsetY: 4,
      underlayerOffsetX: 15,
      underlayerOffsetY: 9,
      underlayerScale: 0.935,
      underlayerOpacity: 0.71,
      biasMaxX: 4,
      biasMaxY: 3,
      exitPushX: 12,
      exitUnderPushX: 10,
    };
  }
  if (category === "tablet") {
    return {
    incomingOffsetX: 13,
    incomingOffsetY: 6,
    underlayerOffsetX: 22,
    underlayerOffsetY: 10,
      underlayerScale: 0.915,
      underlayerOpacity: 0.67,
      biasMaxX: 7,
      biasMaxY: 5,
      exitPushX: 16,
      exitUnderPushX: 14,
    };
  }
  return {
    incomingOffsetX: 22,
    incomingOffsetY: 8,
    underlayerOffsetX: 33,
    underlayerOffsetY: 14,
    underlayerScale: 0.9,
    underlayerOpacity: 0.64,
    biasMaxX: 8,
    biasMaxY: 5,
    exitPushX: 16,
    exitUnderPushX: 13,
  };
}

export function holdForRole(sizeRole: SizeRole): number {
  return HOLD_BY_ROLE[sizeRole];
}

export function incomingFromRight(imageIndex: number): boolean {
  return imageIndex % 2 === 1;
}

export function getFinalBias(imageIndex: number, metrics: PushPullMetrics): { x: number; y: number } {
  const sign = imageIndex % 2 === 0 ? 1 : -1;
  const tier = 1 + (imageIndex % 3) * 0.35;
  return {
    x: sign * metrics.biasMaxX * tier * 0.55,
    y: (imageIndex % 2 === 0 ? 1 : -1) * metrics.biasMaxY * 0.45,
  };
}

function clipFull(r: number): string {
  return `inset(0% 0% 0% 0% round ${r}px)`;
}

function clipClosedHorizontal(r: number, fromRight: boolean): string {
  return fromRight
    ? `inset(0% 100% 0% 0% round ${r}px)`
    : `inset(0% 0% 0% 100% round ${r}px)`;
}

export function resetLayerCard(el: HTMLElement) {
  gsap.set(el, {
    autoAlpha: 0,
    visibility: "hidden",
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    zIndex: 10,
    clipPath: "none",
    willChange: "auto",
  });
}

export function animateFirstImage(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  opts: { x: number; y: number; r: number },
) {
  const { x, y, r } = opts;
  tl.set(el, {
    visibility: "visible",
    autoAlpha: 0,
    x,
    y: y + 18,
    scale: 1,
    rotation: 0,
    zIndex: 20,
    clipPath: `inset(12% 0% 12% 0% round ${r}px)`,
    willChange: "transform, opacity, clip-path",
  });
  tl.to(el, {
    autoAlpha: 1,
    y,
    clipPath: clipFull(r),
    duration: 0.48,
    ease: "power4.out",
  });
  tl.set(el, { clipPath: "none", willChange: "auto" });
}

export function animatePushPullTransition(
  tl: gsap.core.Timeline,
  ctx: {
    incoming: HTMLElement;
    main: HTMLElement;
    outgoing: HTMLElement | null;
    fromRight: boolean;
    metrics: PushPullMetrics;
    finalX: number;
    finalY: number;
    incomingScale: number;
    r: number;
    hasOutgoing: boolean;
  },
) {
  const {
    incoming,
    main,
    outgoing,
    fromRight,
    metrics,
    finalX,
    finalY,
    incomingScale,
    r,
    hasOutgoing,
  } = ctx;

  const dir = fromRight ? 1 : -1;
  const startX = finalX + dir * metrics.incomingOffsetX;
  const startY = finalY + metrics.incomingOffsetY;
  const underX = finalX - dir * metrics.underlayerOffsetX;
  const underY = finalY + metrics.underlayerOffsetY;

  const sync = "pushPull";

  if (hasOutgoing && outgoing) {
    const outDir = fromRight ? -1 : 1;
    const currentX = Number(gsap.getProperty(outgoing, "x")) || 0;
    const currentScale = Number(gsap.getProperty(outgoing, "scale")) || metrics.underlayerScale;
    tl.addLabel(sync);
    tl.set(outgoing, { willChange: "transform, opacity", zIndex: 25 }, sync);
    tl.to(
      outgoing,
      {
        autoAlpha: 0,
        x: currentX + outDir * 18,
        y: "+=8",
        scale: currentScale - 0.03,
        duration: 0.3,
        ease: "power2.in",
      },
      sync,
    );
    tl.set(outgoing, { visibility: "hidden", willChange: "auto" });
  } else {
    tl.addLabel(sync);
  }

  tl.set(
    incoming,
    {
      visibility: "visible",
      autoAlpha: 1,
      x: startX,
      y: startY,
      scale: incomingScale,
      rotation: 0,
      zIndex: 25,
      clipPath: clipClosedHorizontal(r, fromRight),
      willChange: "transform, clip-path",
    },
    sync,
  );

  tl.to(
    incoming,
    {
      x: finalX,
      y: finalY,
      scale: 1,
      clipPath: clipFull(r),
      duration: 0.46,
      ease: "power4.out",
    },
    sync,
  );

  tl.set(main, { willChange: "transform, opacity", zIndex: 10 }, sync);
  tl.to(
    main,
    {
      x: underX,
      y: underY,
      scale: metrics.underlayerScale,
      autoAlpha: metrics.underlayerOpacity,
      rotation: 0,
      duration: 0.5,
      ease: "power3.inOut",
    },
    sync,
  );

  tl.set(incoming, { clipPath: "none", willChange: "auto", zIndex: 20 });
  tl.set(main, { willChange: "auto", zIndex: 10 });
}

export function animateBlockExit(
  tl: gsap.core.Timeline,
  main: HTMLElement,
  under: HTMLElement | null,
  opts: {
    lastFromRight: boolean;
    metrics: PushPullMetrics;
    hadUnder: boolean;
  },
  position: gsap.Position = ">",
): string {
  const { lastFromRight, metrics, hadUnder } = opts;
  const mainDir = lastFromRight ? 1 : -1;
  const underDir = lastFromRight ? -1 : 1;
  const label = "imageExitStart";

  const mainX = Number(gsap.getProperty(main, "x")) || 0;
  const mainY = Number(gsap.getProperty(main, "y")) || 0;
  const underX = under ? Number(gsap.getProperty(under, "x")) || 0 : 0;
  const underY = under ? Number(gsap.getProperty(under, "y")) || 0 : 0;

  tl.addLabel(label, position);
  tl.set([main, ...(under ? [under] : [])], { visibility: "visible", willChange: "transform, opacity" }, label);

  if (hadUnder && under) {
    tl.to(
      under,
      {
        autoAlpha: 0,
        x: underX + underDir * metrics.exitUnderPushX,
        y: underY + 12,
        duration: 0.36,
        ease: "power2.in",
      },
      label,
    );
  }

  tl.to(
    main,
    {
      autoAlpha: 0,
      x: mainX + mainDir * metrics.exitPushX,
      y: mainY - 14,
      duration: 0.43,
      ease: "power3.inOut",
    },
    `${label}+=0.06`,
  );

  tl.set([main, ...(under ? [under] : [])], {
    visibility: "hidden",
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    clipPath: "none",
    willChange: "auto",
  }, `${label}+=0.46`);

  return label;
}

const ROLE_WIDTH_EST: Record<LayoutCategory, Record<SizeRole, number>> = {
  mobile: { small: 200, medium: 240, large: 280, featured: 310 },
  tablet: { small: 300, medium: 360, large: 420, featured: 480 },
  desktop: { small: 520, medium: 610, large: 690, featured: 760 },
};

const ORIENTATION_MUL: Record<Orientation, number> = {
  landscape: 1,
  square: 0.9,
  portrait: 0.74,
};

const MAX_FACTOR: Record<LayoutCategory, number> = {
  mobile: 1.05,
  tablet: 1.08,
  desktop: 1.11,
};

export function getEffectiveSizeFactor(factor: SizeFactor, category: LayoutCategory): number {
  const clamped = Math.min(MAX_FACTOR[category], Math.max(0.78, factor));
  if (category === "mobile") return 1 + (clamped - 1) * 0.65;
  if (category === "tablet") return 1 + (clamped - 1) * 0.85;
  return clamped;
}

export function estimateImageWidth(meta: ImageSizeMeta, category: LayoutCategory): number {
  const base = ROLE_WIDTH_EST[category][meta.sizeRole] * ORIENTATION_MUL[meta.orientation];
  return base * getEffectiveSizeFactor(meta.sizeFactor, category);
}

export function resolveConsecutiveSizeFactor(
  prev: ImageSizeMeta | null,
  entry: { sizeRole: SizeRole; sizeFactor: SizeFactor },
  orientation: Orientation,
  category: LayoutCategory,
): SizeFactor {
  let factor = entry.sizeFactor;
  if (!prev) return factor;

  const prevW = estimateImageWidth(prev, category);
  const minFactorDiff = 0.08;
  const minWidthRatio = category === "mobile" ? 0.9 : category === "tablet" ? 0.88 : 0.86;
  const maxWidthRatio = category === "mobile" ? 1.1 : category === "tablet" ? 1.12 : 1.14;

  const isTooSimilar = (candidate: SizeFactor): boolean => {
    if (Math.abs(candidate - prev.sizeFactor) < minFactorDiff) return true;
    if (prev.orientation !== orientation) return false;
    const nextW = estimateImageWidth(
      { sizeRole: entry.sizeRole, orientation, sizeFactor: candidate },
      category,
    );
    const ratio = nextW / prevW;
    return ratio > minWidthRatio && ratio < maxWidthRatio;
  };

  if (!isTooSimilar(factor)) return factor;

  const smaller = ALLOWED_SIZE_FACTORS.filter(
    (f) => f < prev.sizeFactor && Math.abs(f - prev.sizeFactor) >= minFactorDiff,
  ).sort((a, b) => b - a);
  for (const candidate of smaller) {
    if (!isTooSimilar(candidate)) return candidate;
  }

  const larger = ALLOWED_SIZE_FACTORS.filter(
    (f) => f > prev.sizeFactor && Math.abs(f - prev.sizeFactor) >= minFactorDiff,
  ).sort((a, b) => a - b);
  for (const candidate of larger) {
    if (!isTooSimilar(candidate)) return candidate;
  }

  return factor;
}

export type NextImageHandoff = {
  el: HTMLElement;
  x: number;
  y: number;
  r: number;
};

export type SeparatorHandoffOptions = {
  enterAt?: gsap.Position;
  nextImage?: NextImageHandoff;
  onPrepareNextImage?: () => void;
  onHandoffComplete?: () => void;
};
