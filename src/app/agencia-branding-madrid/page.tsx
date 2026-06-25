import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { madridPage } from "@/content/seo/pages/local";

export const metadata = createPageMetadata({
  title: madridPage.metadataTitle,
  description: madridPage.metadataDescription,
  path: madridPage.path,
});

export default function AgenciaBrandingMadridPage() {
  return <SeoInternalPage page={madridPage} />;
}
