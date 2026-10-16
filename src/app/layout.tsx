import type { Metadata, Viewport } from "next";
import { Open_Sans, Source_Serif_4 } from "next/font/google";
import { content } from "@/lib/content";
import { siteUrl } from "@/lib/site";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
