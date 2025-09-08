import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react"; // This is for Vercel
import { GoogleAnalytics } from "@/components/GoogleAnalytics"; // This is for Google
import type { Locale } from "@/i18n-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://a2ztool.vercel.app'),
  title: "A2Z Tool - Free Online PDF Tools",
  description: "A complete suite of free and secure PDF tools in multiple languages.",
  verification: {
    google: 'ZudKOKP6Q4xPeJDU83AXiaDesb7jR-N8zeyhxRJthv8', // Make sure your code is here
  },
};

const rtlLocales: Locale[] = ['ar', 'ur'];

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const isRtl = rtlLocales.includes(params.lang);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "A2Z Tool",
    "url": "https://a2ztool.vercel.app",
    "logo": "https://a2ztool.vercel.app/icon.png",
  };

  return (
    <html lang={params.lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div className={`${inter.className} bg-gray-50`}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics /> {/* This is for Vercel Analytics */}
        <GoogleAnalytics /> {/* This is for Google Analytics */}
      </body>
    </html>
  );
}