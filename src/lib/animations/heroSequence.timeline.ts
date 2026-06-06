"use client";

import type { gsap } from "@/lib/gsap/gsapClient";
import { runHeroImageSequence, type RunHeroSequenceOptions } from "./heroSequence.runner";

type HeroSequenceSceneOptions = RunHeroSequenceOptions;

/**
 * Sequence scene builder: injects async sequence playback into the provided master timeline.
 * Does not create or run its own timeline.
 */
export function sceneSequence(
  tl: gsap.core.Timeline,
  { signal }: HeroSequenceSceneOptions = {}
): void {
  tl.call(() => {
    tl.pause();
    void runHeroImageSequence({ signal }).finally(() => {
      if (!signal?.aborted) {
        tl.play();
      }
    });
  });
}
