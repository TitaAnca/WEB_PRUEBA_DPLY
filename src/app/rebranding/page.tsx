import { SeoInternalPage } from "@/components/seo/SeoInternalPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { rebrandingPage } from "@/content/seo/pages/rebranding";

export const metadata = createPageMetadata({
  title: rebrandingPage.metadataTitle,
  description: rebrandingPage.metadataDescription,
  path: rebrandingPage.path,
});

export default function RebrandingPage() {
  return <SeoInternalPage page={rebrandingPage} />;
}
