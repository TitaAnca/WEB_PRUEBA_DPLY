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
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

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
        <div className="closing-viewport">
          <ContactoSection />
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
