function HeroScene({ className }: { className: string }) {
  return (
    <div className={`hero-scene ${className}`}>
      <div className="hero-scene-fill" />
      <div className="hero-scene-fragment hero-scene-fragment--left" />
      <div className="hero-scene-fragment hero-scene-fragment--right" />
      <div className="hero-scene-focus" />
      <div className="hero-scene-frame" aria-hidden="true" />
      <div className="hero-scene-duo" aria-hidden="true">
        <img className="hero-scene-duo-img hero-scene-duo-img--a" alt="" decoding="async" />
        <img className="hero-scene-duo-img hero-scene-duo-img--b" alt="" decoding="async" />
      </div>
      <div className="hero-scene-type" aria-hidden="true">
        <div className="hero-scene-type-layer hero-scene-type-layer--a" />
        <div className="hero-scene-type-layer hero-scene-type-layer--b" />
        <div className="hero-scene-type-layer hero-scene-type-layer--c" />
        <div className="hero-scene-type-stroke" />
      </div>
      <div className="hero-scene-statement" aria-hidden="true" />
      <div className="hero-scene-closing" aria-hidden="true">
        <span className="hero-scene-closing-dot" />
        <span className="hero-scene-closing-dot" />
        <span className="hero-scene-closing-dot" />
      </div>
      <img className="hero-scene-main" alt="" decoding="async" />
    </div>
  );
}

/**
 * Dual-layer hero image sequence scenes (driven by heroSequence.runner.ts).
 */
export function HeroSequence() {
  return (
    <div className="hero-sequence" aria-hidden="true">
      <HeroScene className="hero-scene-a" />
      <HeroScene className="hero-scene-b" />
    </div>
  );
}
