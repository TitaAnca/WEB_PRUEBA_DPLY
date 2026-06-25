import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { ciudadRealPage } from "@/content/seo/pages/local";

export const metadata = createPageMetadata({
  title: ciudadRealPage.metadataTitle,
  description: ciudadRealPage.metadataDescription,
  path: ciudadRealPage.path,
});

export default function AgenciaBrandingCiudadRealPage() {
  return <SeoInternalPage page={ciudadRealPage} />;
}
