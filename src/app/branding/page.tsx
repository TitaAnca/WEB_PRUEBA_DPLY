import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { brandingPage } from "@/content/seo/pages/branding";

export const metadata = createPageMetadata({
  title: brandingPage.metadataTitle,
  description: brandingPage.metadataDescription,
  path: brandingPage.path,
});

export default function BrandingPage() {
  return <SeoInternalPage page={brandingPage} />;
}
