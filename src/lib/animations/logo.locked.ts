/**
 * Locked logo: hero visibility swap + scroll imagotype returns to hero.
 * Ported from index.html inline script.
 */

export function setupHeroLogoSwap(): () => void {
  const heroSection = document.querySelector(".landing-block--hero");
  const fullLogo = document.querySelector(".hero-logo-full");
  const symbolLogo = document.querySelector(".hero-logo-symbol");
  if (!heroSection || !fullLogo || !symbolLogo) return () => undefined;

  const logoSwap = document.querySelector(".hero-logo-swap");

  /**
   * Y (viewport) de la banda donde vive el logotipo (esquina superior
   * izquierda). Si la sección Hero cubre ese punto, el logo debe permanecer
   * SIEMPRE en su variante blanca (_LOGO_BlancoRojo.svg) y nunca mostrar el
   * negro (_LOGO_NegroRojo.svg), independientemente del tema de nav.
   */
  const getLogoBandY = (): number => {
    const rect = logoSwap?.getBoundingClientRect();
    if (rect && rect.height > 0) return rect.top + rect.height * 0.5;
    return 56;
  };

  const applyHeroState = () => {
    const rect = heroSection.getBoundingClientRect();
    const heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    document.body.classList.toggle("hero-past", !heroVisible);

    // El Hero "posee" la banda del logo cuando su rect cubre la Y del logo.
    const logoY = getLogoBandY();
    const heroOwnsLogo = rect.top <= logoY && rect.bottom > logoY;
    document.body.classList.toggle("in-hero-band", heroOwnsLogo);
  };

  const observer = new IntersectionObserver(() => {
    applyHeroState();
  }, {
    threshold: [0, 0.01],
  });

  let ticking = false;
  const syncOnScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      applyHeroState();
    });
  };

  observer.observe(heroSection);
  window.addEventListener("scroll", syncOnScroll, { passive: true });
  window.addEventListener("resize", syncOnScroll);
  applyHeroState();

  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", syncOnScroll);
    window.removeEventListener("resize", syncOnScroll);
  };
}

export function setupScrollImagotypeToHero(): () => void {
  const imgs = document.querySelectorAll(".site-brand .hero-logo-symbol");
  const heroEl = document.getElementById("inicio");
  if (!imgs.length) return () => undefined;

  const onClick = (e: Event) => {
    if (!document.body.classList.contains("hero-past")) return;
    e.preventDefault();
    e.stopPropagation();
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  imgs.forEach((img) => {
    img.addEventListener("click", onClick);
  });

  return () => {
    imgs.forEach((img) => img.removeEventListener("click", onClick));
  };
}
