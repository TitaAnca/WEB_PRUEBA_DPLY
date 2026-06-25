import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { disenoWebPage } from "@/content/seo/pages/diseno-web";

export const metadata = createPageMetadata({
  title: disenoWebPage.metadataTitle,
  description: disenoWebPage.metadataDescription,
  path: disenoWebPage.path,
});

export default function DisenoWebPage() {
  return <SeoInternalPage page={disenoWebPage} />;
}
