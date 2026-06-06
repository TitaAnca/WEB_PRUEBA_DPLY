/**
 * Locked logo system — fixed viewport slot; swap driven by logo.locked.ts + CSS.
 */
export function LogoSystemLocked() {
  return (
    <a href="#inicio" className="site-brand" aria-label="Etecé Studio">
      <span className="hero-logo-swap" aria-hidden="true">
        <img
          src="/assets/_LOGO_NegroRojo.svg"
          alt="Etecé Studio"
          className="hero-logo-img hero-logo-full hero-logo-full--light"
        />
        <img
          src="/assets/_LOGO_BlancoRojo.svg"
          alt=""
          className="hero-logo-img hero-logo-full hero-logo-full--dark"
          aria-hidden
        />
        <img
          src="/assets/Símbolo_EtecéStudio_Rojo.svg"
          alt=""
          className="hero-logo-img hero-logo-symbol hero-logo-symbol--light"
          aria-hidden
        />
        <img
          src="/assets/Símbolo_Etecé_Blanco.svg"
          alt=""
          className="hero-logo-img hero-logo-symbol hero-logo-symbol--dark"
          aria-hidden
        />
      </span>
    </a>
  );
}
