/**
 * Preloader: ETECE STUDIO — precision fade + red activation sweep.
 *
 *  Stage 1 · Silence        — white background, calm short pause.
 *  Stage 2 · Formal reveal  — Preloader_EtecéStudio.svg fades in (opacity
 *                             0 → 1) with a micro vertical lift (y 12 → 0).
 *                             Long expo.out ease for a refined entrance.
 *                             clearProps strips the transform on completion
 *                             so the SVG sits at its native CSS layout.
 *  Stage 3 · Hold           — locked black logo, perfectly sharp.
 *  Stage 4 · Red activation — a thin red hairline travels across the logo,
 *                             painting Preloader_EtecéStudio_Rojo.svg on
 *                             top via a synchronised left→right clip-path
 *                             reveal. Symbol and STUDIO turn red as the
 *                             band passes; ETECE stays black.
 *  Stage 5 · Lock           — final coloured logo holds, crisp and stable.
 *  Stage 6 · Exit           — stage drifts up and fades out cleanly.
 *
 * Sharpness rules applied:
 *   • Exactly two <img> layers, both at full opacity scale 1 at rest.
 *   • Entrance tween uses force3D:false → no GPU compositor layer is ever
 *     created on the black logo → SVG renders straight from the vector.
 *   • clearProps "transform,willChange" after the entrance tween removes
 *     every inline transform and rendering hint.
 *   • Color layer is never transformed; only clip-path animates.
 *   • Sweep uses `left` (layout, not transform) → no GPU-layer blur.
 *   • Final state: both layers at x:0 y:0 scale:1 opacity:1, the color
 *     layer fully open at clip-path inset(0 0 0 0), zero ghost layers.
 */
const NAV_SCROLL_THRESHOLD = 28;

const body = document.body;
const preloader = document.getElementById("preloader");
const nav = document.getElementById("siteNav");
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("siteMenu");
const navIntentDot = document.getElementById("navIntentDot");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function completePreloader() {
  if (preloader) {
    preloader.classList.add("is-done");
    preloader.setAttribute("aria-hidden", "true");
    preloader.style.pointerEvents = "none";
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

function runPreloaderTimeline(ctx) {
  const { stage, blackLayer, colorLayer, sweep } = ctx;
  const g = window.gsap;

  return new Promise((resolve) => {
    const tl = g.timeline({
      onComplete: resolve,
      defaults: { ease: "power3.out" },
    });

    // ─── Stage 0: prime every layer ───────────────────────────────────────
    // Black layer parked 12px below its final position with opacity 0.
    // Color layer is opaque but clipped fully to the left edge. Sweep is
    // parked off-stage. No GPU layer is created until the entrance starts.
    tl.set(stage, { opacity: 1, y: 0 })
      .set(blackLayer, {
        opacity: 0,
        y: 12,
        transformOrigin: "50% 50%",
        force3D: false,
      })
      .set(colorLayer, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" })
      .set(sweep, { opacity: 0, left: "-6%" });

    // ─── Stage 1: white silence ───────────────────────────────────────────
    tl.to({}, { duration: 0.45 });

    // ─── Stage 2: formal entrance — precision fade + micro lift ───────────
    // Single tween on the single black logo layer. expo.out gives a long,
    // refined deceleration that feels editorial without bounce or wipe
    // artefacts. force3D:false prevents a GPU compositor layer from being
    // created, so the SVG never goes through sub-pixel rasterisation.
    // clearProps strips the inline transform at the end → final state is
    // a plain CSS-laid-out <img> rendering straight from the SVG vector.
    tl.addLabel("reveal").to(
      blackLayer,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        force3D: false,
        clearProps: "transform,willChange",
      },
      "reveal"
    );

    // ─── Stage 3: hold the sharp black logo ───────────────────────────────
    // No transforms, no will-change — the SVG renders crisp from vector.
    tl.to({}, { duration: 0.5 });

    // ─── Stage 4: red activation — the hero moment ────────────────────────
    // A thin red hairline travels left → right across the locked logo. In
    // perfect sync, the colour layer's clip-path opens behind the band,
    // so the band "paints" the official red lockup into existence: symbol
    // first, then accent, then STUDIO. ETECE stays black (both layers
    // have it black, so no flicker).
    tl.addLabel("sweep", ">")
      .set(sweep, { opacity: 1 }, "sweep")
      .to(
        sweep,
        { left: "108%", duration: 1.1, ease: "power2.inOut" },
        "sweep"
      )
      .to(
        colorLayer,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power2.inOut",
        },
        "sweep"
      )
      // Soften the band out before it leaves the frame — no harsh exit.
      .to(
        sweep,
        { opacity: 0, duration: 0.26, ease: "power2.out" },
        "sweep+=0.86"
      );

    // ─── Stage 5: hold the final coloured logo ────────────────────────────
    // Drop will-change so both SVG layers render from native CSS at full
    // sharpness. Final visible state is exactly Preloader_EtecéStudio_Rojo.svg
    // overlaid pixel-perfect on the static black base.
    tl.add(() => {
      g.set(colorLayer, { clearProps: "willChange" });
      g.set(sweep, { clearProps: "willChange" });
    });
    tl.to({}, { duration: 0.55 });

    // ─── Stage 6: clean exit — no white flash, no jump ────────────────────
    tl.addLabel("exit")
      .to(
        stage,
        {
          y: -8,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "exit"
      )
      .to(
        preloader,
        {
          opacity: 0,
          duration: 0.55,
          ease: "power2.out",
        },
        "exit+=0.08"
      );
  });
}

async function runPreloader() {
  if (!preloader) {
    await completePreloader();
    return;
  }

  const stage = preloader.querySelector(".preloader-stage");
  const blackLayer = preloader.querySelector(".preloader-logo-layer--black");
  const colorLayer = preloader.querySelector(".preloader-logo-layer--color");
  const sweep = preloader.querySelector(".px-sweep");

  body.classList.add("preloading");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reduced-motion / no-GSAP fallback: skip the entrance and the sweep,
  // present the final coloured logo immediately, then fade out cleanly.
  if (!window.gsap || reduceMotion) {
    if (blackLayer) {
      blackLayer.style.opacity = "1";
      blackLayer.style.transform = "none";
    }
    if (colorLayer) {
      colorLayer.style.opacity = "1";
      colorLayer.style.clipPath = "inset(0 0 0 0)";
    }
    await wait(700);
    if (preloader) preloader.style.opacity = "0";
    await wait(420);
    await completePreloader();
    return;
  }

  // Safety net: if anything is missing, show the coloured logo and bail.
  if (!stage || !blackLayer || !colorLayer || !sweep) {
    if (colorLayer) {
      window.gsap.set(colorLayer, { opacity: 1, clipPath: "inset(0 0 0 0)" });
    }
    await wait(500);
    await completePreloader();
    return;
  }

  try {
    await runPreloaderTimeline({ stage, blackLayer, colorLayer, sweep });
  } catch (e) {
    console.error(e);
  }
  await completePreloader();
}

function handleScrollNavState() {
  if (window.scrollY > NAV_SCROLL_THRESHOLD) {
    body.classList.add("nav-scrolled");
  } else {
    body.classList.remove("nav-scrolled");
  }
}

function setupRevealObserver() {
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
}

function setupMobileMenu() {
  if (!menuToggle || !menu || !nav) return;

  const menuLinks = Array.from(menu.querySelectorAll("a"));
  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;
  let intentClearTimer = null;
  let intentShowTimer = null;

  const moveIntentDotTo = (link, { show = true } = {}) => {
    if (!navIntentDot || !link || !isDesktop()) return;
    const menuRect = menu.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const x = linkRect.left - menuRect.left + linkRect.width / 2 - 3.5;
    const y = linkRect.bottom - menuRect.top + 6;
    menu.style.setProperty("--dot-x", `${x}px`);
    menu.style.setProperty("--dot-y", `${y}px`);
    if (show) {
      if (intentShowTimer) clearTimeout(intentShowTimer);
      intentShowTimer = setTimeout(() => {
        menu.classList.add("dot-visible");
      }, 55);
    }
  };

  const hideIntentDot = () => {
    if (!navIntentDot) return;
    if (intentShowTimer) {
      clearTimeout(intentShowTimer);
      intentShowTimer = null;
    }
    menu.classList.remove("dot-visible");
  };

  const getSectionLink = () => {
    const ids = ["inicio", "nosotros", "enfoque", "contacto"];
    const midpoint = window.innerHeight * 0.34;
    let activeId = "inicio";
    ids.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const top = section.getBoundingClientRect().top;
      if (top <= midpoint) activeId = id;
    });
    return menu.querySelector(`a[href="#${activeId}"]`) || menuLinks[0];
  };

  const refreshIntentDot = () => {
    if (!isDesktop()) return;
    const activeLink = getSectionLink();
    if (activeLink) moveIntentDotTo(activeLink, { show: menu.classList.contains("dot-visible") || nav.classList.contains("menu-open") });
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    nav.classList.remove("menu-open");
    nav.classList.remove("nav-intent");
    menuToggle.setAttribute("aria-expanded", "false");
    if (isDesktop()) {
      const activeLink = getSectionLink();
      if (activeLink) moveIntentDotTo(activeLink, { show: false });
      setTimeout(hideIntentDot, 140);
    } else {
      hideIntentDot();
    }
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", isOpen);
    nav.classList.toggle("menu-open", isOpen);
    nav.classList.toggle("nav-intent", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (isDesktop()) {
      const activeLink = getSectionLink();
      if (activeLink) moveIntentDotTo(activeLink, { show: isOpen });
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("mouseenter", () => moveIntentDotTo(link));
    link.addEventListener("focus", () => moveIntentDotTo(link));
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  nav.addEventListener("pointerenter", () => {
    if (!isDesktop()) return;
    nav.classList.add("nav-intent");
    const activeLink = getSectionLink();
    if (activeLink) moveIntentDotTo(activeLink);
  });

  nav.addEventListener("pointerleave", () => {
    if (!isDesktop() || nav.classList.contains("menu-open")) return;
    nav.classList.remove("nav-intent");
    hideIntentDot();
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("pointermove", (event) => {
    if (!isDesktop() || nav.classList.contains("menu-open")) return;
    const nearTop = event.clientY <= 120;
    if (nearTop) {
      nav.classList.add("nav-intent");
      if (intentClearTimer) {
        clearTimeout(intentClearTimer);
        intentClearTimer = null;
      }
      const activeLink = getSectionLink();
      if (activeLink) moveIntentDotTo(activeLink);
      return;
    }

    if (intentClearTimer) clearTimeout(intentClearTimer);
    intentClearTimer = setTimeout(() => {
      nav.classList.remove("nav-intent");
      hideIntentDot();
    }, 280);
  }, { passive: true });

  window.addEventListener("scroll", refreshIntentDot, { passive: true });
  window.addEventListener("resize", () => {
    if (!isDesktop()) {
      nav.classList.remove("nav-intent");
      hideIntentDot();
    }
    refreshIntentDot();
  });

  // Seed a location for the dot from the active section.
  refreshIntentDot();
}

window.addEventListener("load", async () => {
  setupMobileMenu();
  handleScrollNavState();
  await runPreloader();
  setupRevealObserver();
});

window.addEventListener("scroll", handleScrollNavState, { passive: true });
