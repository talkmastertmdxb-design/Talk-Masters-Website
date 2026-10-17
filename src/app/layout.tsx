import type { Metadata, Viewport } from "next";
import { Open_Sans, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { content } from "@/lib/content";
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

/** Marks JS as available before first paint, so the hero can hide for its intro without a flash. */
const jsFlag = "document.documentElement.classList.add('js')";

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
          <SiteHeader items={mainNav} />
          {children}
          <div id="contact">
            <SiteFooter items={mainNav} />
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
