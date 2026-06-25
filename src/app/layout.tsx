import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://etecestudio.com";
const SITE_TITLE = "Etecé Studio | Branding, diseño web y comunicación visual";
const SITE_DESCRIPTION =
  "Estudio de branding, diseño web y comunicación visual. Creamos identidades, webs y sistemas visuales para que todo lo demás también importe.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Etecé Studio",
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "branding",
    "diseño web",
    "comunicación visual",
    "identidad visual",
    "dirección creativa",
    "estrategia de marca",
    "diseño gráfico",
    "estudio de branding",
    "agencia de branding",
    "Etecé Studio",
  ],
  creator: "Etecé Studio",
  publisher: "Etecé Studio",
  category: "branding, diseño web y comunicación visual",
  alternates: {
    canonical: "/",
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
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/Favicon_EteceStudio_Rojo.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico",
  },
};

// JSON-LD (ProfessionalService). Solo datos verificados: web, email, servicios,
// país, perfiles sociales reales y logo (ruta sin acentos, segura para URL).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Etecé Studio",
  url: SITE_URL,
  email: "contacto@etecestudio.com",
  description: SITE_DESCRIPTION,
  logo: `${SITE_URL}/assets/_LOGO_NegroRojo.svg`,
  areaServed: {
    "@type": "Country",
    name: "España",
  },
  serviceType: [
    "Branding",
    "Diseño web",
    "Identidad visual",
    "Comunicación visual",
    "Dirección creativa",
    "Estrategia de marca",
    "Diseño editorial",
    "Diseño de packaging",
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
