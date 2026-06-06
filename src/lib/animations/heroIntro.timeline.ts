"use client";

import type { gsap } from "@/lib/gsap/gsapClient";

const SCENES = ["s01", "s02"];

type HeroIntroSceneOptions = {
  intro: HTMLElement;
};

/**
 * Intro scene builder: appends intro animation steps into the provided master timeline.
 * Does not create or run its own timeline.
 */
export function sceneIntro(tl: gsap.core.Timeline, { intro }: HeroIntroSceneOptions): void {
  const mainDots = intro.querySelectorAll(".brand-intro-main-dots span");

  const setScene = (sceneName: string | null) => {
    intro.classList.remove(...SCENES);
    if (sceneName) intro.classList.add(sceneName);
  };

  const resetDots = () => {
    mainDots.forEach((dot) => dot.classList.remove("is-on"));
  };

  tl.call(() => {
    intro.classList.add("is-active");
    intro.classList.remove("is-exiting", ...SCENES);
    resetDots();
    setScene("s01");
  });

  // Scene 01: black fullscreen intro layer, no visible elements for 0.4s.
  tl.call(() => {
    resetDots();
  });
  tl.to(intro, { duration: 0.4 });

  // Scene 02: reveal three giant centered white dots.
  tl.call(() => {
    mainDots.forEach((dot) => dot.classList.add("is-on"));
    setScene("s02");
  });
  tl.to(intro, { duration: 0.8 });

  tl.call(() => intro.classList.add("is-exiting"));
  tl.to(intro, { duration: 0.12 });

  tl.call(() => {
    intro.classList.remove("is-active", "is-exiting", ...SCENES);
    resetDots();
  });
}
