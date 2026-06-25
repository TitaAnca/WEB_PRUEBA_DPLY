import { SITE_EMAIL, SITE_URL, SOCIAL_PROFILES, DEFAULT_DESCRIPTION } from "./site";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "ETECÉ STUDIO",
  url: SITE_URL,
  email: SITE_EMAIL,
  description: DEFAULT_DESCRIPTION,
  logo: `${SITE_URL}/assets/_LOGO_NegroRojo.svg`,
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "AdministrativeArea", name: "Comunidad de Madrid" },
    { "@type": "AdministrativeArea", name: "Castilla-La Mancha" },
    { "@type": "City", name: "Madrid" },
    { "@type": "City", name: "Ciudad Real" },
  ],
  serviceType: [
    "Branding",
    "Identidad visual",
    "Rebranding",
    "Diseño web",
    "Comunicación visual",
    "Estrategia de marca",
    "Dirección creativa",
  ],
  sameAs: [...SOCIAL_PROFILES],
};

export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: input.url,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "España",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}
