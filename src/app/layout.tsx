import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Open_Sans, Source_Serif_4 } from "next/font/google";
import { EchoChat } from "@/components/echo/EchoChat";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { content } from "@/lib/content";
import { introScript } from "@/lib/motion/intro";
import { mainNav } from "@/lib/navigation";
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

const { clubName, parentOrganisation, description } = content.settings;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${clubName} | Public Speaking & Leadership, ${parentOrganisation}`,
    template: `%s | ${clubName}`,
  },
  description,
  openGraph: { type: "website", siteName: clubName, locale: "en" },
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
        {/* Cookieless visit counts and real-visitor Core Web Vitals; both report only on Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
