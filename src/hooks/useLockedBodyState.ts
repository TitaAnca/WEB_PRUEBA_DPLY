"use client";

import { useEffect } from "react";

/**
 * Optional helper to mirror body lock classes during nested flows.
 * Preloader still owns initial `preloading` / `site-revealed` contract.
 */
export function useLockedBodyState(locked: boolean, className = "hero-flow-lock"): void {
  useEffect(() => {
    if (!locked) return;
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [locked, className]);
}
