"use client";

/**
 * Create an AbortController for animation/async work; abort on cleanup.
 * Use inside `useEffect` in consuming components.
 */
export function createAnimationAbortController(): AbortController {
  return new AbortController();
}
