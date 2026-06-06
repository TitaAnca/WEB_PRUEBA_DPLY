"use client";

/**
 * Scroll reveal for `[data-reveal]` (legacy IntersectionObserver).
 * Call after preloader completes.
 */
export function setupRevealObserver(): () => void {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18,
    }
  );

  revealItems.forEach((item) => observer.observe(item));

  return () => observer.disconnect();
}

/** Marks end of hero intro+sequence for CSS/telemetry hooks. */
export function onHeroFlowComplete(): void {
  document.body.dataset.heroFlow = "complete";
}
