import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://etecestudio.com";
const SITE_TITLE =
  "Etecé Studio | Agencia de branding, diseño web y comunicación visual";
const SITE_DESCRIPTION =
  "Agencia de branding, diseño web y comunicación visual. Creamos marcas, identidades visuales, sistemas gráficos y webs con estrategia, dirección creativa y coherencia.";
// Variante breve para tarjetas sociales (OG/Twitter).
const SHARE_DESCRIPTION =
  "Creamos marcas, identidades visuales, sistemas gráficos y webs con estrategia, dirección creativa y coherencia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Etecé Studio",
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "agencia de branding",
    "agencia de diseño",
    "agencia de comunicación visual",
    "agencia de diseño gráfico",
    "agencia de marcas",
    "estudio de branding",
    "estudio de diseño",
    "diseño web",
    "diseño web para marcas",
    "branding",
    "branding para empresas",
    "identidad visual",
    "diseño de identidad visual",
    "estrategia de marca",
    "dirección creativa",
    "comunicación visual",
    "diseño gráfico",
    "sistemas visuales",
    "diseño editorial",
    "diseño de packaging",
    "creación de marca",
    "rediseño de marca",
    "Etecé Studio",
  ],
  creator: "Etecé Studio",
  publisher: "Etecé Studio",
  category: "Branding, diseño web y comunicación visual",
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // NOTA SEO: no existe aún /public/og-image.(jpg|png), así que se omite el array
  // `images` para no referenciar un asset inexistente. Cuando se añada la imagen
  // de 1200×630 px, incluir `images` en openGraph y twitter.
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "Etecé Studio",
    title: SITE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

// JSON-LD (ProfessionalService). Solo datos verificados: web, email, servicios,
// país, perfiles sociales reales y logo (ruta sin acentos, segura para URL).
// Sin dirección, teléfono, reseñas, clientes ni premios inventados.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Etecé Studio",
  alternateName: "ETECÉ STUDIO",
  url: SITE_URL,
  email: "contacto@etecestudio.com",
  description: SITE_DESCRIPTION,
  slogan: "Etecé es la filosofía de hacer que todo lo demás importe.",
  logo: `${SITE_URL}/assets/_LOGO_NegroRojo.svg`,
  areaServed: [
    {
      "@type": "Country",
      name: "España",
    },
  ],
  knowsAbout: [
    "Branding",
    "Diseño web",
    "Comunicación visual",
    "Identidad visual",
    "Diseño gráfico",
    "Estrategia de marca",
    "Dirección creativa",
    "Diseño editorial",
    "Diseño de packaging",
    "Sistemas visuales de marca",
    "Creación de marca",
    "Rediseño de marca",
  ],
  serviceType: [
    "Agencia de branding",
    "Diseño web",
    "Diseño gráfico",
    "Comunicación visual",
    "Identidad visual",
    "Estrategia de marca",
    "Dirección creativa",
    "Diseño editorial",
    "Diseño de packaging",
    "Sistemas visuales de marca",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de branding, diseño y comunicación visual",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Branding e identidad visual",
          description:
            "Creación y desarrollo de marcas, identidades visuales y sistemas gráficos coherentes.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Diseño web",
          description:
            "Diseño de webs para marcas que necesitan presencia digital, coherencia visual y comunicación clara.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Comunicación visual",
          description:
            "Diseño de piezas, sistemas visuales y recursos gráficos para comunicar marcas con intención.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Estrategia de marca y dirección creativa",
          description:
            "Definición de criterio, tono visual y dirección creativa para construir marcas reconocibles.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Diseño editorial y packaging",
          description:
            "Diseño de soportes editoriales, packaging y piezas gráficas para marcas y proyectos visuales.",
        },
      },
    ],
  },
  sameAs: [
    "https://www.instagram.com/etece_studio/",
    "https://x.com/etecestudio",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=Jura:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=Poppins:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="preloading" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
