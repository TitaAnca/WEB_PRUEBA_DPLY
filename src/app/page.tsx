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
        <HeroSection />
        <NosotrosSection />
        <EnfoqueSection />
        <ContactoSection />
      </main>
      <SiteFooter />
    </>
  );
}
