import { HeroSection } from "@/components/hero/HeroSection";
import { ContactoSection } from "@/components/sections/ContactoSection";
import { EnfoqueSection } from "@/components/sections/EnfoqueSection";
import { NosotrosSection } from "@/components/sections/NosotrosSection";
import { SiteFooter } from "@/components/SiteFooter";
import { LandingRuntime } from "@/components/system/LandingRuntime";
import { LogoSystemLocked } from "@/components/system/LogoSystemLocked";
import { MobileNav } from "@/components/system/MobileNav";
import { NavigationLocked } from "@/components/system/NavigationLocked";
import { PreloaderLocked } from "@/components/system/PreloaderLocked";

export default function HomePage() {
  return (
    <>
      <LandingRuntime />
      <PreloaderLocked />
      <LogoSystemLocked />
      <NavigationLocked />
      <MobileNav />
      <main className="narrative-flow">
        {/* h1 principal para SEO/accesibilidad: oculto visualmente (no altera el
            diseño ni el layout), expone el posicionamiento de marca a buscadores
            y lectores de pantalla. */}
        <h1
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Etecé Studio — Branding, diseño web y comunicación visual
        </h1>
        <HeroSection />
        <NosotrosSection />
        <EnfoqueSection />
        <ContactoSection />
      </main>
      <SiteFooter />
    </>
  );
}
