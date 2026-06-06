import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etecé Studio | Branding & Comunicación Visual",
  description:
    "Estudio de branding y comunicación visual. Diseñamos identidades con criterio, precisión y visión editorial.",
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
        {children}
      </body>
    </html>
  );
}
