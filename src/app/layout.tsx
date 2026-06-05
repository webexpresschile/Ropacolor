import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ropaunicolor.cl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ropa Unicolor | Básicos premium para hombre y mujer",
    template: "%s | Ropa Unicolor",
  },
  description:
    "Poleras, buzos, polerones y pantalones unicolor de calidad premium. Compra al detalle o accede a precios mayoristas desde 3 unidades. Envíos a todo Chile.",
  keywords: [
    "ropa unicolor",
    "poleras",
    "buzos",
    "polerones",
    "pantalones",
    "básicos",
    "mayorista",
    "chile",
  ],
  authors: [{ name: "Ropa Unicolor" }],
  creator: "Ropa Unicolor",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "Ropa Unicolor",
    title: "Ropa Unicolor | Básicos premium",
    description:
      "Poleras, buzos, polerones y pantalones unicolor. Compra al detalle o por mayor.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ropa Unicolor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ropa Unicolor",
    description: "Básicos unicolor premium para hombre y mujer.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-ink antialiased">
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
