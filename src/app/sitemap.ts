import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://etecestudio.com";
  const lastModified = new Date();

  // Solo páginas reales. Nosotros/Enfoque/Contacto son secciones (anclas) del
  // home, no rutas, así que no se incluyen. /admin queda fuera (noindex).
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/portal-transparencia`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
