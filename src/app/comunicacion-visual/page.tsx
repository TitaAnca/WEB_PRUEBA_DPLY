import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { comunicacionVisualPage } from "@/content/seo/pages/comunicacion-visual";

export const metadata = createPageMetadata({
  title: comunicacionVisualPage.metadataTitle,
  description: comunicacionVisualPage.metadataDescription,
  path: comunicacionVisualPage.path,
});

export default function ComunicacionVisualPage() {
  return <SeoInternalPage page={comunicacionVisualPage} />;
}
