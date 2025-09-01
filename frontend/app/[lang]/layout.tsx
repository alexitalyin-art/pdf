import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import type { Locale } from "@/i18n-config";

const inter = Inter({ subsets: ["latin"] });

// --- THIS IS THE FIX ---
// We've added `metadataBase` which helps Google understand your official URL.
export const metadata: Metadata = {
  metadataBase: new URL('https://a2ztool.vercel.app'), // Add your base URL
  title: "A2Z Tool - Free Online PDF Tools",
  description: "A complete suite of free and secure PDF tools in multiple languages.",
  verification: {
    google: 'YOUR_UNIQUE_CODE_HERE', // Make sure your verification code is still here
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

  return (
    <html lang={params.lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <body className={`${inter.className} bg-gray-50`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}