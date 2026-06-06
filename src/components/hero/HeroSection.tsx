"use client";

import { HeroCinematic } from "./HeroCinematic";

/**
 * Hero — secuencia cinemática editorial (tres puntos + bloques Block01–06).
 * El preloader sigue siendo independiente; la secuencia arranca tras site-revealed.
 */
export function HeroSection() {
  return (
    <section className="landing-block landing-block--hero" data-theme="dark">
      <div className="story-block hero" id="inicio" data-reveal>
        <HeroCinematic />
      </div>
    </section>
  );
}
