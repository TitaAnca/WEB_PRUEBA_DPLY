import { gsap } from "@/lib/gsap/gsapClient";
import {
  HERO_SEPARATOR_BY_KEY,
  SEPARATOR_TONE_COLORS,
  type SeparatorLength,
  type SeparatorTone,
} from "./heroSeparators.config";
import type { LayoutCategory, TransitionKey } from "./heroOffsetAnimation";
import type { NextImageHandoff, SeparatorHandoffOptions } from "./heroOffsetAnimation";

function clipFull(r: number): string {
  return `inset(0% 0% 0% 0% round ${r}px)`;
}

function charInterval(category: LayoutCategory): number {
  if (category === "mobile") return 0.026;
  if (category === "tablet") return 0.03;
  return 0.036;
}

function wordPause(category: LayoutCategory): number {
  return category === "mobile" ? 0.05 : 0.055;
}

function holdForLength(length: SeparatorLength): number {
  if (length === "short") return 0.68;
  if (length === "medium") return 0.78;
  return 0.88;
}

function resetSeparatorChars(tEl: HTMLElement) {
  const phrase = tEl.querySelector<HTMLElement>("[data-separator-phrase]");
  const chars = Array.from(tEl.querySelectorAll<HTMLElement>("[data-schar]"));
  chars.forEach((ch) => {
    const tone = (ch.dataset.tone ?? "light") as SeparatorTone;
    const colors = SEPARATOR_TONE_COLORS[tone];
    gsap.set(ch, {
      opacity: 0,
      y: "0.05em",
      color: colors.start,
      visibility: "visible",
      clearProps: "transform",
    });
  });
  if (phrase) {
    gsap.set(phrase, { opacity: 1, y: 0, visibility: "visible" });
  }
}

export function addWordLedComposition(
  tl: gsap.core.Timeline,
  tEl: HTMLElement,
  key: TransitionKey,
  handoff?: SeparatorHandoffOptions,
  category: LayoutCategory = "desktop",
) {
  const phraseDef = HERO_SEPARATOR_BY_KEY[key];
  const phrase = tEl.querySelector<HTMLElement>("[data-separator-phrase]");
  const chars = Array.from(tEl.querySelectorAll<HTMLElement>("[data-schar]"));
  const sepLabel = `sep-${key}`;
  const enterAt = handoff?.enterAt ?? ">";
  const interval = charInterval(category);
  const pause = wordPause(category);
  const textEnterDelay = 0.15;
  const hold = holdForLength(phraseDef.length);

  tl.addLabel(sepLabel, enterAt);

  tl.call(
    () => {
      gsap.set(tEl, { visibility: "visible", opacity: 1, zIndex: 50 });
      resetSeparatorChars(tEl);
    },
    undefined,
    sepLabel,
  );

  let cursor = textEnterDelay;
  chars.forEach((ch) => {
    const tone = (ch.dataset.tone ?? "light") as SeparatorTone;
    const colors = SEPARATOR_TONE_COLORS[tone];
    const at = `${sepLabel}+=${cursor}`;

    tl.fromTo(
      ch,
      { opacity: 0, y: "0.05em", color: colors.start },
      {
        opacity: 1,
        y: 0,
        color: colors.final,
        duration: 0.11,
        ease: "power2.out",
      },
      at,
    );

    cursor += interval;
    if (ch.dataset.wordEnd === "true") {
      cursor += pause;
    }
  });

  const holdStart = `${sepLabel}+=${cursor + 0.02}`;
  tl.to({}, { duration: hold }, holdStart);

  const textExitLabel = "textExitStart";
  tl.addLabel(textExitLabel, ">");

  if (handoff?.onPrepareNextImage) {
    tl.call(handoff.onPrepareNextImage, undefined, `${textExitLabel}+=0.02`);
  }

  if (handoff?.nextImage) {
    const { el, x, y, r } = handoff.nextImage;
    tl.call(
      () => {
        gsap.set(el, {
          visibility: "visible",
          autoAlpha: 0,
          x,
          y: y + 18,
          scale: 1,
          rotation: 0,
          zIndex: 15,
          clipPath: `inset(12% 0% 12% 0% round ${r}px)`,
          willChange: "transform, opacity, clip-path",
        });
      },
      undefined,
      `${textExitLabel}+=0.08`,
    );
  }

  if (phrase) {
    const exitY = category === "desktop" ? -6 : -4;
    tl.to(
      phrase,
      {
        opacity: 0,
        y: exitY,
        duration: 0.3,
        ease: "power2.inOut",
      },
      textExitLabel,
    );
  }

  if (handoff?.nextImage) {
    const { el, x, y, r } = handoff.nextImage;
    tl.to(
      el,
      {
        autoAlpha: 1,
        y,
        clipPath: clipFull(r),
        duration: 0.46,
        ease: "power4.out",
      },
      `${textExitLabel}+=0.22`,
    );
    tl.set(el, { clipPath: "none", willChange: "auto", zIndex: 20 }, `${textExitLabel}+=0.68`);
  }

  tl.to(tEl, { opacity: 0, duration: 0.08, ease: "power2.in" }, `${textExitLabel}+=0.32`);
  tl.call(() => {
    gsap.set(tEl, { visibility: "hidden", opacity: 0 });
    resetSeparatorChars(tEl);
    handoff?.onHandoffComplete?.();
  });
}
