import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { identidadVisualPage } from "@/content/seo/pages/identidad-visual";

export const metadata = createPageMetadata({
  title: identidadVisualPage.metadataTitle,
  description: identidadVisualPage.metadataDescription,
  path: identidadVisualPage.path,
});

export default function IdentidadVisualPage() {
  return <SeoInternalPage page={identidadVisualPage} />;
}
