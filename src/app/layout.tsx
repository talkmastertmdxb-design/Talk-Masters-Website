import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Open_Sans, Source_Serif_4 } from "next/font/google";
import { EchoChat } from "@/components/echo/EchoChat";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";
import { introScript } from "@/lib/motion/intro";
import { mainNav } from "@/lib/navigation";
import { siteJsonLd } from "@/lib/seo/structured-data";
import { siteUrl } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const { clubName, description, meeting } = content.settings;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  // The city in every title: guests search "public speaking club Dubai", "Toastmasters club Dubai".
  title: {
    default: `${clubName} ${meeting.city} | Toastmasters Public Speaking Club`,
    template: `%s | ${clubName} ${meeting.city}`,
  },
  description,
  openGraph: { type: "website", siteName: clubName, locale: "en" },
  // The share image itself is src/app/opengraph-image.jpg and twitter-image.jpg (npm run share:image).
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

/** Before first paint: marks JS as available and decides whether the home intro plays. */
const jsFlag = introScript;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader items={mainNav} meeting={content.settings.meeting} socials={content.settings.socials} />
          {children}
        </MotionProvider>
        <EchoChat script={content.echo} meeting={content.settings.meeting} />
        <JsonLd data={siteJsonLd(content.settings, siteUrl, content.history.foundedYear)} />
        {/* Cookieless visit counts and real-visitor Core Web Vitals; both report only on Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
