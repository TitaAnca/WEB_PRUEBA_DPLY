/**
 * Locked navigation: section contrast, theme colors, social icon src swap,
 * label ellipsis hover, social icon redraw hover.
 * Ported from legacy/static-site working implementation.
 */
import { gsap } from "@/lib/gsap/gsapClient";

type NavLinkWithCleanup = HTMLAnchorElement & {
  _navHoverCleanup?: () => void;
  _navIconHoverCleanup?: () => void;
};

/**
 * Tema VISUAL (color del fondo físico, no semántico) de cada sección:
 *  - "dark"  → fondo oscuro → label blanca / logo blanco / icono blanco
 *  - "light" → fondo claro  → label negra  / logo rojo  / icono rojo
 *
 * El color de cada elemento fijo (logo, iconos sociales, cada label) se decide
 * por la sección que está físicamente DETRÁS de ese elemento (su rect), no por
 * la sección "activa". Así nunca hay blanco sobre blanco ni negro sobre negro.
 */
type SectionColorTheme = "dark" | "light";

const SECTION_COLOR_THEMES: { selector: string; theme: SectionColorTheme }[] = [
  { selector: ".landing-block--hero", theme: "dark" },
  { selector: ".landing-block--nosotros", theme: "light" },
  { selector: ".landing-block--enfoque", theme: "dark" },
  { selector: ".landing-block--contacto", theme: "light" },
  { selector: ".site-footer", theme: "dark" },
];

function setupNavSocialHoverGsap(): () => void {
  const isTouchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const labelLinks = Array.from(
    document.querySelectorAll(".text-nav a[data-nav]")
  ) as NavLinkWithCleanup[];
  const iconLinks = Array.from(
    document.querySelectorAll(".text-nav .nav-social-link")
  ) as NavLinkWithCleanup[];

  if (!iconLinks.length) {
    return () => {};
  }

  gsap.set(labelLinks, { y: 0, letterSpacing: "0.14em" });
  gsap.set(iconLinks, { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });

  labelLinks.forEach((labelLink) => {
    if (labelLink._navHoverCleanup) {
      labelLink._navHoverCleanup();
      labelLink._navHoverCleanup = undefined;
    }

    const wordSpan =
      labelLink.querySelector(".nav-label-word") ||
      (() => {
        const ws = document.createElement("span");
        ws.className = "nav-label-word";
        while (labelLink.firstChild) {
          ws.appendChild(labelLink.firstChild);
        }
        labelLink.appendChild(ws);
        return ws;
      })();

    let ellipsis = wordSpan.querySelector(".nav-label-ellipsis");
    if (!ellipsis) {
      ellipsis = labelLink.querySelector(".nav-label-ellipsis");
      if (ellipsis && ellipsis.parentElement !== wordSpan) {
        wordSpan.appendChild(ellipsis);
      }
    }
    if (!ellipsis) {
      ellipsis = document.createElement("span");
      ellipsis.className = "nav-label-ellipsis";
      ellipsis.setAttribute("aria-hidden", "true");
      const dotA = document.createElement("span");
      const dotB = document.createElement("span");
      const dotC = document.createElement("span");
      dotA.className = "nav-label-ellipsis-dot";
      dotB.className = "nav-label-ellipsis-dot";
      dotC.className = "nav-label-ellipsis-dot";
      ellipsis.append(dotA, dotB, dotC);
      wordSpan.appendChild(ellipsis);
    }

    const dots = Array.from(
      ellipsis.querySelectorAll(".nav-label-ellipsis-dot")
    ) as HTMLElement[];

    function timingForViewport() {
      if (window.matchMedia("(max-width: 767px)").matches) {
        return { duration: 0.4, stagger: 0.038 };
      }
      if (window.matchMedia("(max-width: 1024px)").matches) {
        return { duration: 0.44, stagger: 0.044 };
      }
      return { duration: 0.5, stagger: 0.052 };
    }

    function measureEllipsisXs() {
      const w = Math.max(0, wordSpan.getBoundingClientRect().width);
      const d = dots[0]?.getBoundingClientRect().width || 5.5;
      const pad = 1.5;
      const maxLeft = Math.max(0, w - d - pad);
      let g = Math.min(5, Math.max(0, (w - 3 * d - 2 * pad) / 2));
      let endX2 = maxLeft;
      let endX1 = endX2 - d - g;
      let endX0 = endX1 - d - g;
      while (endX0 < pad && g > 0.25) {
        g -= 0.25;
        endX1 = endX2 - d - g;
        endX0 = endX1 - d - g;
      }
      if (endX0 < pad) endX0 = pad;
      if (endX1 < endX0) endX1 = endX0;
      if (endX2 < endX1) endX2 = endX1;
      const cluster = Math.min(2.5, Math.max(1, d * 0.4));
      let startX0 = pad;
      let startX1 = pad + cluster;
      let startX2 = pad + cluster * 2;
      const clampLeft = (x: number) => Math.min(Math.max(0, x), maxLeft);
      startX0 = clampLeft(startX0);
      startX1 = clampLeft(startX1);
      startX2 = clampLeft(startX2);
      endX0 = clampLeft(endX0);
      endX1 = clampLeft(endX1);
      endX2 = clampLeft(endX2);
      return {
        startXs: [startX0, startX1, startX2],
        endXs: [endX0, endX1, endX2],
      };
    }

    let tl: gsap.core.Timeline | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let ellipsisResizeTick: gsap.core.Tween | null = null;

    function rebuildEllipsisTimeline() {
      const timing = timingForViewport();
      const { startXs, endXs } = measureEllipsisXs();
      if (tl) {
        tl.kill();
        tl = null;
      }
      gsap.killTweensOf(dots, "opacity,x");
      gsap.set(ellipsis, { opacity: 1, x: 0, y: 0 });
      gsap.set(dots, { opacity: 0, x: (i) => startXs[i] || 0 });
      tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.to(
        dots,
        {
          opacity: 1,
          x: (i) => endXs[i] || 0,
          duration: timing.duration,
          stagger: timing.stagger,
        },
        0
      );
      return timing;
    }

    let timing = rebuildEllipsisTimeline();

    const play = () => {
      timing = rebuildEllipsisTimeline();
      tl?.play(0);
    };
    const reverse = () => {
      tl?.reverse();
    };
    let touchReset: gsap.core.Tween | null = null;
    const tapPreview = () => {
      play();
      if (touchReset) touchReset.kill();
      const hold = timing.duration + timing.stagger * (dots.length - 1) + 0.22;
      touchReset = gsap.delayedCall(hold, reverse);
    };

    labelLink.addEventListener("mouseenter", play);
    labelLink.addEventListener("mouseleave", reverse);
    labelLink.addEventListener("focus", play);
    labelLink.addEventListener("blur", reverse);
    if (isTouchLike) {
      labelLink.addEventListener("touchstart", tapPreview, { passive: true });
    }

    function onLabelEllipsisResize() {
      if (ellipsisResizeTick) ellipsisResizeTick.kill();
      ellipsisResizeTick = gsap.delayedCall(0.08, () => {
        ellipsisResizeTick = null;
        const hovering =
          labelLink.matches(":hover") || document.activeElement === labelLink;
        timing = rebuildEllipsisTimeline();
        if (hovering && tl) {
          tl.progress(1, false);
        } else if (tl) {
          tl.pause(0);
        }
      });
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(onLabelEllipsisResize);
      resizeObserver.observe(wordSpan);
    }

    requestAnimationFrame(() => {
      timing = rebuildEllipsisTimeline();
    });

    labelLink._navHoverCleanup = () => {
      labelLink.removeEventListener("mouseenter", play);
      labelLink.removeEventListener("mouseleave", reverse);
      labelLink.removeEventListener("focus", play);
      labelLink.removeEventListener("blur", reverse);
      if (isTouchLike) {
        labelLink.removeEventListener("touchstart", tapPreview);
      }
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (ellipsisResizeTick) {
        ellipsisResizeTick.kill();
        ellipsisResizeTick = null;
      }
      if (touchReset) touchReset.kill();
      if (tl) {
        tl.kill();
        tl = null;
      }
    };
  });

  iconLinks.forEach((iconLink) => {
    if (iconLink._navIconHoverCleanup) {
      iconLink._navIconHoverCleanup();
      iconLink._navIconHoverCleanup = undefined;
    }

    const baseIcon = iconLink.querySelector(
      ".nav-social-icon--png"
    ) as HTMLImageElement | null;
    if (!baseIcon) {
      iconLink._navIconHoverCleanup = () => {};
      return;
    }

    const iconEl = baseIcon;
    const iconSlot = iconLink.querySelector(".nav-social-icon-slot");
    let redrawIcon: HTMLImageElement | null = null;

    function mountRedrawFromVisualSource(): HTMLImageElement {
      if (redrawIcon?.parentNode) {
        redrawIcon.remove();
      }
      const clone = iconEl.cloneNode(true) as HTMLImageElement;
      clone.classList.add("nav-social-redraw");
      clone.setAttribute("aria-hidden", "true");
      (iconSlot || iconLink).append(clone);
      redrawIcon = clone;
      return clone;
    }

    const mountedRedraw = mountRedrawFromVisualSource();
    if (iconSlot && mountedRedraw.parentElement !== iconSlot) {
      iconSlot.append(mountedRedraw);
    }

    let redrawTl: gsap.core.Timeline | null = null;
    let socialHoverGen = 0;

    function killAndResetSocialIcon() {
      socialHoverGen += 1;
      if (redrawTl) {
        redrawTl.kill();
        redrawTl = null;
      }
      const killTargets = [baseIcon, iconLink].concat(
        redrawIcon ? [redrawIcon] : []
      );
      gsap.killTweensOf(killTargets);
      gsap.set(baseIcon, {
        clearProps: "opacity,transform,clipPath,webkitClipPath",
      });
      if (redrawIcon) {
        gsap.set(redrawIcon, {
          clearProps: "opacity,transform,clipPath,webkitClipPath",
        });
      }
      gsap.set(iconLink, { clearProps: "opacity,transform" });
      gsap.set(baseIcon, {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        immediateRender: true,
      });
      if (redrawIcon) {
        gsap.set(redrawIcon, {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 0,
          clipPath: "inset(0 100% 0 0)",
          immediateRender: true,
        });
      }
      gsap.set(iconLink, {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        immediateRender: true,
      });
    }

    function playRedraw() {
      killAndResetSocialIcon();
      mountRedrawFromVisualSource();
      const gen = socialHoverGen;

      redrawTl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (gen !== socialHoverGen) return;
          const endTargets = [baseIcon].concat(redrawIcon ? [redrawIcon] : []);
          gsap.killTweensOf(endTargets);
          gsap.set(baseIcon, { opacity: 1, immediateRender: true });
          if (redrawIcon) {
            gsap.set(redrawIcon, {
              opacity: 0,
              clipPath: "inset(0 100% 0 0)",
              immediateRender: true,
            });
          }
          redrawTl = null;
        },
      });

      redrawTl
        .to(baseIcon, { opacity: 0, duration: 0.07, ease: "power1.out" }, 0)
        .to(redrawIcon, { opacity: 1, duration: 0.01, ease: "none" }, 0.06)
        .to(redrawIcon, { clipPath: "inset(0 0% 0 0)", duration: 0.24 }, 0.07)
        .to(baseIcon, { opacity: 1, duration: 0.11 }, 0.23)
        .to(redrawIcon, { opacity: 0, duration: 0.09 }, 0.31);
    }

    killAndResetSocialIcon();

    let touchReset: gsap.core.Tween | null = null;
    const tapPreview = () => {
      playRedraw();
      if (touchReset) touchReset.kill();
      touchReset = gsap.delayedCall(0.52, killAndResetSocialIcon);
    };

    iconLink.addEventListener("mouseenter", playRedraw);
    iconLink.addEventListener("mouseleave", killAndResetSocialIcon);
    iconLink.addEventListener("focus", playRedraw);
    iconLink.addEventListener("blur", killAndResetSocialIcon);
    if (isTouchLike) {
      iconLink.addEventListener("touchstart", tapPreview, { passive: true });
    }

    iconLink._navIconHoverCleanup = () => {
      iconLink.removeEventListener("mouseenter", playRedraw);
      iconLink.removeEventListener("mouseleave", killAndResetSocialIcon);
      iconLink.removeEventListener("focus", playRedraw);
      iconLink.removeEventListener("blur", killAndResetSocialIcon);
      if (isTouchLike) {
        iconLink.removeEventListener("touchstart", tapPreview);
      }
      if (touchReset) touchReset.kill();
      killAndResetSocialIcon();
      redrawIcon?.remove();
      redrawIcon = null;
    };
  });

  return () => {
    labelLinks.forEach((link) => {
      link._navHoverCleanup?.();
      link._navHoverCleanup = undefined;
    });
    iconLinks.forEach((link) => {
      link._navIconHoverCleanup?.();
      link._navIconHoverCleanup = undefined;
    });
  };
}

/**
 * Locked navigation contrast + active section + theme colors.
 * Also wires social/label GSAP hover (same entry point as legacy `window.load`).
 */
export function setupContrastNav(): () => void {
  const body = document.body;
  const nav = document.querySelector(".text-nav nav");
  const heroLogo = document.querySelector(".hero-logo-swap");
  const trackedBlocks = Array.from(
    document.querySelectorAll(
      ".landing-block--nosotros, .landing-block--enfoque, .landing-block--contacto"
    )
  );
  const links = Array.from(
    document.querySelectorAll(".text-nav a[data-nav]")
  ) as HTMLAnchorElement[];

  // Secciones físicas + su tema de fondo. Se consultan una vez (los elementos
  // son estables); los rects se recalculan en cada apply() con
  // getBoundingClientRect → inmune al pin de ScrollTrigger.
  const colorSections = SECTION_COLOR_THEMES.map((s) => ({
    el: document.querySelector<HTMLElement>(s.selector),
    theme: s.theme,
  })).filter(
    (s): s is { el: HTMLElement; theme: SectionColorTheme } => Boolean(s.el)
  );

  /**
   * Tema (claro/oscuro) del FONDO que está físicamente bajo el punto vertical
   * `vy` (viewport-space). Sin zona muerta: si `vy` no cae dentro de ninguna
   * sección, devuelve el tema de la más cercana (nunca un color invisible).
   */
  const colorThemeAtViewportY = (vy: number): SectionColorTheme => {
    let nearest: SectionColorTheme = "dark";
    let nearestDist = Infinity;
    for (const { el, theme } of colorSections) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= vy && vy < rect.bottom) return theme;
      const dist = vy < rect.top ? rect.top - vy : vy - rect.bottom;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = theme;
      }
    }
    return nearest;
  };

  /**
   * Color de UNA label, independiente del resto, según el fondo físico tras su
   * centro. Cada label se trata por separado (ya no hay color de grupo). Se
   * memoiza por dataset para no relanzar el tween en cada frame.
   */
  const setLabelTheme = (label: HTMLElement, theme: SectionColorTheme) => {
    if (label.dataset.navColorTheme === theme) return;
    label.dataset.navColorTheme = theme;
    const color = theme === "dark" ? "#FFFFFF" : "#000000";
    gsap.to(label, {
      color,
      webkitTextFillColor: color,
      duration: 0.26,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const socialRow = document.querySelector<HTMLElement>(
    ".text-nav nav .nav-social-row"
  );

  const getCurrentBlock = () => {
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    let activeBlock: Element | null = null;
    let maxOverlap = -1;

    for (const block of trackedBlocks) {
      const el = block as HTMLElement;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const overlap = Math.max(
        0,
        Math.min(viewportBottom, bottom) - Math.max(viewportTop, top)
      );
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        activeBlock = block;
      }
    }

    if (maxOverlap <= 0) return null;
    return activeBlock;
  };

  const apply = () => {
    if (!nav) return;

    // ── Estado activo · SOLO para is-active / data-nav-section / section-*.
    // Ya NO decide el color de las labels (cada una se mide por su fondo). ──
    const currentBlock = getCurrentBlock();
    const activeId = currentBlock
      ? (currentBlock as HTMLElement).id || null
      : null;
    body.setAttribute("data-nav-section", activeId || "none");
    body.classList.toggle("section-nosotros", activeId === "nosotros");
    body.classList.toggle("section-enfoque", activeId === "enfoque");
    body.classList.toggle("section-contacto", activeId === "contacto");
    links.forEach((a) =>
      a.classList.toggle(
        "is-active",
        Boolean(activeId && a.dataset.nav === activeId)
      )
    );

    // ── LABELS · color por-label según el fondo físico tras CADA label.
    // (NOSOTROS puede ser negra mientras CONTACTO es blanca si están sobre
    // secciones distintas: cada una usa su propio centro vertical). ──
    links.forEach((a) => {
      const rect = a.getBoundingClientRect();
      setLabelTheme(a, colorThemeAtViewportY(rect.top + rect.height / 2));
    });

    // ── LOGO · color según el fondo físico tras el logo (esquina sup-izq) ──
    const logoRect = heroLogo?.getBoundingClientRect();
    const logoY = logoRect ? logoRect.top + logoRect.height / 2 : 48;
    const logoTheme = colorThemeAtViewportY(logoY);
    body.classList.toggle("on-dark-bg", logoTheme === "dark");
    body.classList.toggle("on-light-bg", logoTheme === "light");
    // data-nav-theme conserva el override del logo blanco mientras el hero
    // cubre la banda del logo (body[data-nav-theme="dark"] + in-hero-band).
    // "red" sobre fondo claro = sin override → manda on-light-bg/on-dark-bg.
    body.setAttribute("data-nav-theme", logoTheme === "dark" ? "dark" : "red");

    // ── SOCIAL · color según el fondo físico tras la fila de iconos ──
    if (socialRow) {
      const sRect = socialRow.getBoundingClientRect();
      const socialTheme = colorThemeAtViewportY(sRect.top + sRect.height / 2);
      socialRow.classList.toggle("nav-social--on-dark", socialTheme === "dark");
      socialRow.classList.toggle(
        "nav-social--on-light",
        socialTheme === "light"
      );
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      apply();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  apply();

  const cleanHover = setupNavSocialHoverGsap();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cleanHover();
  };
}
