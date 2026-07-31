import { Suspense } from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import "./circulo.css";
import { CirculoSiteChrome } from "@/components/CirculoSiteChrome";
import { CirculoFooter } from "@/components/CirculoFooter";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { CmsEditModeBootstrap } from "@/components/cms/CmsEditModeBootstrap";
import { CirculoAmigosCmsEditProvider } from "@/components/cms/CirculoAmigosCmsEditContext";
import { CmsProvider } from "@/lib/cms/provider";
import { SITE_URL } from "@/lib/site-config";
import { cmsFaviconUrl } from "@/lib/cms-favicon-url";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Círculo de Amigos OINADOM — Nueva Acrópolis República Dominicana",
    template: "%s | Círculo de Amigos OINADOM",
  },
  description:
    "Espacio abierto para quienes valoran los principios de Nueva Acrópolis y desean participar en sus actividades sin integrarse como miembros regulares.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Círculo de Amigos OINADOM",
    description:
      "Tu camino hacia la sabiduría y el servicio comienza aquí — Nueva Acrópolis República Dominicana.",
    url: SITE_URL,
    siteName: "Círculo de Amigos OINADOM",
    locale: "es_DO",
    type: "website",
  },
  icons: {
    icon: [{ url: cmsFaviconUrl("circulodeamigos"), type: "image/webp" }],
    shortcut: cmsFaviconUrl("circulodeamigos"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://editor.acropolis.adesa.com.do"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://editor.acropolis.adesa.com.do" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.parent!==window){document.documentElement.classList.add("cms-edit-embedded")}}catch(e){}try{var api=${JSON.stringify(
              process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "") || "",
            )};if(!api)return;var u=api+"/content/circulodeamigos/published";var slot=window.__circuloCmsPublished=window.__circuloCmsPublished||{};if(slot.promise)return;slot.promise=new Promise(function(resolve){function boot(){fetch(u,{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){slot.doc=d;resolve(d)}).catch(function(){resolve(null)})}if(window.requestIdleCallback)requestIdleCallback(boot,{timeout:2500});else setTimeout(boot,1)})}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <SiteAnalytics site="circulodeamigos" />
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          <Suspense fallback={null}>
            <CirculoAmigosCmsEditProvider>
              <CirculoSiteChrome>{children}</CirculoSiteChrome>
              <CirculoFooter />
            </CirculoAmigosCmsEditProvider>
          </Suspense>
        </CmsProvider>
      </body>
    </html>
  );
}
