import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin es un visor interno (ya marcado noindex); no debe rastrearse.
      disallow: "/admin",
    },
    sitemap: "https://etecestudio.com/sitemap.xml",
  };
}
