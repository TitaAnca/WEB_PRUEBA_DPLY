import type { MetadataRoute } from "next";
import { PUBLIC_SITEMAP_ROUTES, SITE_URL } from "@/lib/seo/publicRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path === "" ? SITE_URL : `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
