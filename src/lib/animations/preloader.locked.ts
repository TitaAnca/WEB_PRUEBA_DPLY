/**
 * Active preloader timeline.
 *
 * Sequence (user spec):
 *   1. White silence                (0.35s)
 *   2. Black outline draw            (1.5s)  stroke-dashoffset on all draw paths
 *   3. Black fill morph              (0.6s)  stroke fades out, fill+text fade in
 *   4. Red horizontal sweep L→R     (1.2s)  sweep bar travels left→right, coloured
 *                                            <img> clip-path opens L→R in perfect sync
 *   5. Hold final coloured lockup   (0.4s)
 *   6. Clean exit fade              (0.5s)
 *
 * Sharpness contract: no filter, no scale, no transform on final state.
 *   • Inline SVG renders from vector path geometry (no rasterisation).
 *   • Final coloured <img> uses object-fit:contain inside an aspect-locked box.
 *   • clearProps wipes inline transforms at every stage end.
 *   • Sweep clip-path animates only the `right` inset → strictly horizontal.
 */
import { gsap } from "@/lib/gsap/gsapClient";

const NAV_SCROLL_THRESHOLD = 28;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    gsap.delayedCall(Math.max(0, ms) / 1000, resolve);
  });
}

function nextFrame() {
  return wait(16);
}

function handleScrollNavState() {
  const body = document.body;
  if (window.scrollY > NAV_SCROLL_THRESHOLD) {
    body.classList.add("nav-scrolled");
  } else {
    body.classList.remove("nav-scrolled");
  }
}

async function completePreloader(preloader: HTMLElement | null, nav: HTMLElement | null) {
  const body = document.body;

  if (preloader) {
    preloader.classList.add("is-done");
    preloader.setAttribute("aria-hidden", "true");
    preloader.style.opacity = "";
    preloader.style.visibility = "";
    preloader.style.pointerEvents = "";
  }
  body.classList.remove("preloading");
  body.classList.add("post-intro", "site-revealed");

  const hero = document.getElementById("inicio");
  if (hero) hero.classList.add("is-visible");

  if (nav) {
    nav.classList.remove("floating-nav--intro");
    nav.classList.add("is-ready");
    nav.setAttribute("aria-hidden", "false");
  }

  await nextFrame();
  await nextFrame();
  handleScrollNavState();
}

interface PreloaderCtx {
  preloader: HTMLElement;
  stage: HTMLElement;
  strokeLayer: SVGGElement;
  fillLayer: SVGGElement;
  studioText: SVGTextElement;
  drawPaths: SVGGeometryElement[];
  colorLayer: HTMLElement;
  sweep: HTMLElement;
}

/**
 * Measure each drawable element's real geometric path length and rewrite
 * stroke-dasharray + stroke-dashoffset to that exact length. Result:
 *   • dasharray = length, dashoffset = length → path is fully hidden, but
 *     the dash pattern matches the geometry exactly.
 *   • Animating dashoffset → 0 then renders ONE continuous pen stroke
 *     along the path, regardless of how many sub-paths it contains.
 * This is the standard cross-browser SVG draw technique.
 */
function primeDrawPaths(drawPaths: SVGGeometryElement[]) {
  drawPaths.forEach((el) => {
    let len = 0;
    try {
      len = el.getTotalLength();
    } catch {
      len = 200000;
    }
    if (!len || !Number.isFinite(len)) len = 200000;
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
  });
}

function runPreloaderTimeline(ctx: PreloaderCtx) {
  const {
    preloader,
    stage,
    strokeLayer,
    fillLayer,
    studioText,
    drawPaths,
    colorLayer,
    sweep,
  } = ctx;

  // Measure path lengths synchronously, before the timeline is even
  // constructed, so every path's dash pattern matches its real geometry
  // for the entire animation. Higher specificity inline style locks in
  // immediately — no possibility of the SSR-baked 200000 value bleeding
  // into the animation interpolation.
  primeDrawPaths(drawPaths);

  return new Promise<void>((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });

    // Frame 0 — initial state. Stroke layer stays opacity:0 through the
    // white silence so even the (already-invisible) stroked paths can't
    // possibly leak. Fill, STUDIO, colour layer, sweep all locked closed.
    tl.set(stage, { opacity: 1, y: 0, force3D: false })
      .set(strokeLayer, { opacity: 0 })
      .set(fillLayer, { opacity: 0 })
      .set(studioText, { opacity: 0 })
      .set(colorLayer, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" })
      // Horizontal travel only — sweep bar parked 6% off the left edge.
      .set(sweep, { opacity: 0, left: "-6%", top: "-8%" });

    // ── 1. White silence ──────────────────────────────────────────────────
    tl.to({}, { duration: 0.294 });

    // ── 2. Outline draw ───────────────────────────────────────────────────
    // ALL 11 paths start drawing at the SAME instant and finish at the
    // SAME instant. No stagger → the eye reads it as ONE drawing operation
    // across the whole lockup, not a series of separate elements being
    // revealed in sequence. Per-path dash pattern is each path's real
    // geometric length (primeDrawPaths ran synchronously above), so every
    // path animates dashoffset → 0 in lockstep with everyone else.
    //
    //   duration   = 1.7s   (per spec: 1.4s–1.8s, sat at "not too fast")
    //   stagger    = none   (everything draws together)
    //   ease       = power2.out — gentle deceleration, elegant
    tl.addLabel("draw")
      .set(strokeLayer, { opacity: 1 }, "draw")
      .to(
        drawPaths,
        {
          strokeDashoffset: 0,
          duration: 1.424,
          ease: "power2.out",
        },
        "draw"
      );

    // ── 3. Black fill morph ───────────────────────────────────────────────
    // Stroke fades out as fill + STUDIO fade in TOGETHER (single fromTo
    // on both targets, identical duration, identical ease) → the WHOLE
    // logo (brackets, dots, ETECE letters, STUDIO) flips from outline to
    // solid black as a single unit. No staggered "STUDIO arrives later"
    // effect — final state matches Preloader_EtecéStudio_Negro.svg exactly.
    tl.addLabel("fill", ">+=0.05")
      .to(strokeLayer, { opacity: 0, duration: 0.461, ease: "power2.inOut" }, "fill")
      .fromTo(
        [fillLayer, studioText],
        { opacity: 0 },
        { opacity: 1, duration: 0.461, ease: "power2.inOut" },
        "fill"
      )
      .add(() => {
        gsap.set(drawPaths, { clearProps: "all" });
      });

    // Brief hold of the sharp solid-black logo.
    tl.to({}, { duration: 0.21 });

    // ── 4. Red horizontal sweep L→R ───────────────────────────────────────
    // Sweep bar animates the `left` CSS property only (zero vertical motion).
    // Coloured layer's clip-path animates the `right` inset only — strictly
    // horizontal. Both share the same duration and ease so the band visually
    // "paints" the coloured lockup as it travels.
    tl.addLabel("sweep", ">")
      .set(sweep, { opacity: 1 }, "sweep")
      .to(
        sweep,
        { left: "108%", duration: 0.921, ease: "power2.inOut" },
        "sweep"
      )
      .to(
        colorLayer,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.921,
          ease: "power2.inOut",
        },
        "sweep"
      )
      .to(
        sweep,
        { opacity: 0, duration: 0.184, ease: "power2.out" },
        "sweep+=0.72"
      );

    // ── 5. Hold final coloured logo ───────────────────────────────────────
    tl.add(() => {
      gsap.set(colorLayer, { clearProps: "willChange" });
      gsap.set(sweep, { clearProps: "willChange" });
    });
    tl.to({}, { duration: 0.335 });

    // ── 6. Clean exit ─────────────────────────────────────────────────────
    tl.addLabel("exit")
      .to(
        stage,
        { y: -8, opacity: 0, duration: 0.378, ease: "power2.in" },
        "exit"
      )
      .to(
        preloader,
        { opacity: 0, duration: 0.419, ease: "power2.out" },
        "exit+=0.068"
      );
  });
}

async function runReducedMotionIntro(
  preloader: HTMLElement | null,
  nav: HTMLElement | null
) {
  // Reduced motion: skip the build and the sweep. Show coloured layer immediately.
  const strokeLayer = document.querySelector(
    "#preloader .preloader-stroke-layer"
  ) as SVGGElement | null;
  const fillLayer = document.querySelector(
    "#preloader .preloader-fill-layer"
  ) as SVGGElement | null;
  const studioText = document.querySelector(
    "#preloader .preloader-studio-text"
  ) as SVGTextElement | null;
  const colorLayer = document.querySelector(
    ".preloader-logo-layer--color"
  ) as HTMLElement | null;
  if (strokeLayer) strokeLayer.style.opacity = "0";
  if (fillLayer) fillLayer.style.opacity = "1";
  if (studioText) studioText.style.opacity = "1";
  if (colorLayer) {
    colorLayer.style.opacity = "1";
    colorLayer.style.clipPath = "inset(0 0 0 0)";
  }
  await wait(351);
  if (preloader) {
    gsap.to(preloader, { opacity: 0, duration: 0.378, ease: "power2.out" });
  }
  await wait(403);
  await completePreloader(preloader, nav);
}

let preloaderSingleton: Promise<void> | null = null;

async function runLockedPreloaderImpl(): Promise<void> {
  const body = document.body;
  const preloader = document.getElementById("preloader");
  const stage = document.querySelector(".preloader-stage") as HTMLElement | null;
  const strokeLayer = document.querySelector(
    "#preloader .preloader-stroke-layer"
  ) as SVGGElement | null;
  const fillLayer = document.querySelector(
    "#preloader .preloader-fill-layer"
  ) as SVGGElement | null;
  const studioText = document.querySelector(
    "#preloader .preloader-studio-text"
  ) as SVGTextElement | null;
  const colorLayer = document.querySelector(
    ".preloader-logo-layer--color"
  ) as HTMLElement | null;
  const sweep = document.querySelector("#preloader .px-sweep") as HTMLElement | null;
  const drawPaths = Array.from(
    document.querySelectorAll("#preloader .preloader-stroke-layer .draw-path")
  ) as SVGGeometryElement[];
  const nav = document.getElementById("siteNav");

  if (
    !preloader ||
    !stage ||
    !strokeLayer ||
    !fillLayer ||
    !studioText ||
    !colorLayer ||
    !sweep ||
    !drawPaths.length
  ) {
    body.classList.remove("preloading");
    if (preloader) {
      preloader.classList.add("is-done");
      preloader.setAttribute("aria-hidden", "true");
    }
    await completePreloader(preloader, nav);
    return;
  }

  body.classList.add("preloading");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    await runReducedMotionIntro(preloader, nav);
    return;
  }

  try {
    await runPreloaderTimeline({
      preloader,
      stage,
      strokeLayer,
      fillLayer,
      studioText,
      drawPaths,
      colorLayer,
      sweep,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  await completePreloader(preloader, nav);
}

/**
 * Run the locked preloader sequence (single in-flight promise for Strict Mode safety).
 */
export function runLockedPreloader(): Promise<void> {
  const body = document.body;
  if (body.classList.contains("site-revealed")) {
    // Client navigation back to home remounts #preloader without is-done; the fixed
    // white overlay would otherwise sit above the page indefinitely.
    const preloader = document.getElementById("preloader");
    const nav = document.getElementById("siteNav");
    return completePreloader(preloader, nav);
  }
  if (!preloaderSingleton) {
    preloaderSingleton = runLockedPreloaderImpl();
  }
  return preloaderSingleton;
}

export function setupScrollNavStateListener(): () => void {
  const onScroll = () => handleScrollNavState();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
