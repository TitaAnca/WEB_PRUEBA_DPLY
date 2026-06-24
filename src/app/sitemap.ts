import type { MetadataRoute } from "next";
import { PUBLIC_SITEMAP_ROUTES, SITE_URL } from "@/lib/seo/publicRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path === "" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
