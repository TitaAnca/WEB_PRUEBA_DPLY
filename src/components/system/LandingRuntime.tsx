"use client";

import { runLockedPreloader, setupScrollNavStateListener } from "@/lib/animations/preloader.locked";
import { setupHeroLogoSwap, setupScrollImagotypeToHero } from "@/lib/animations/logo.locked";
import { setupContrastNav } from "@/lib/animations/nav.locked";
import { setupRevealObserver } from "@/lib/animations/landingReveal.timeline";
import { useEffect } from "react";

/**
 * Single startup orchestration: locked nav/logo listeners, then preloader, then reveal observer.
 */
export function LandingRuntime() {
  useEffect(() => {
    const cleanLogo = setupHeroLogoSwap();
    const cleanImagotype = setupScrollImagotypeToHero();
    const cleanContrast = setupContrastNav();
    const cleanScrollNav = setupScrollNavStateListener();

    let alive = true;
    let revealCleanup: (() => void) | undefined;

    void (async () => {
      await runLockedPreloader();
      if (!alive) return;
      revealCleanup = setupRevealObserver();
    })();

    return () => {
      alive = false;
      cleanLogo();
      cleanImagotype();
      cleanContrast();
      cleanScrollNav();
      revealCleanup?.();
    };
  }, []);

  return null;
}
