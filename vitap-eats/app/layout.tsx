import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import { OfflineBanner } from "@/components/OfflineBanner";
import { WebVitals } from "@/components/WebVitals";

export const metadata: Metadata = {
  title: { default: "ZipVIT", template: "%s | ZipVIT" },
  description: "Lightning-fast campus food & essentials delivery — order now, collect at Main Gate.",
  keywords: ["food delivery", "BiteBox", "campus delivery", "ZipVIT"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "ZipVIT", statusBarStyle: "default" },
  openGraph: {
    title: "ZipVIT",
    description: "Lightning-fast campus delivery across VIT-AP University.",
    siteName: "ZipVIT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4D0805",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        {/* PWA: Offline detection banner */}
        <OfflineBanner />
        {/* Performance: Core Web Vitals instrumentation */}
        <WebVitals />
      </body>
    </html>
  );
}