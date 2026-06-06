"use client";

import { sceneIntro } from "@/lib/animations/heroIntro.timeline";
import { sceneSequence } from "@/lib/animations/heroSequence.timeline";
import { onHeroFlowComplete } from "@/lib/animations/landingReveal.timeline";
import { gsap } from "@/lib/gsap/gsapClient";
import { waitForSiteReveal } from "@/utils/siteReveal";

export type HeroMasterOptions = {
  introRoot: HTMLElement | null;
  signal?: AbortSignal;
};

/**
 * Single hero master timeline controlling intro + sequence.
 * HeroSection is the only initializer that calls this function.
 */
export async function runHeroMasterFlow({ introRoot, signal }: HeroMasterOptions): Promise<void> {
  await waitForSiteReveal();
  if (signal?.aborted || !introRoot) return;

  const tl = gsap.timeline({ paused: true });

  sceneIntro(tl, { intro: introRoot });
  sceneSequence(tl, { signal });
  tl.call(() => {
    if (!signal?.aborted) {
      onHeroFlowComplete();
    }
  });

  await new Promise<void>((resolve) => {
    const onAbort = () => {
      tl.kill();
      resolve();
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    tl.eventCallback("onComplete", () => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    });

    tl.play(0);
  });
}
