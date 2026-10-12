import type { Metadata } from "next";
import { site, pageMetadata } from "@/lib/site/config";
import { Analytics } from "@/components/site/analytics";
import { SiteFrame } from "@/components/site/site-frame";
import { Manrope, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./catalog.css";
import "./shadcn-theme.css";
import { GrainOverlay } from "@/components/effects/grain-overlay";
import { DesignProvider } from "@/components/design-kit/design-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata("Write Your Screenplay. Watch It Come Alive.", site.description, "/"),
  title: { default: "ScriptFX — Write Your Screenplay. Watch It Come Alive.", template: "%s | ScriptFX" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${manrope.variable} ${satoshi.variable}`}>
      <body
        className="min-h-screen bg-surface text-on-surface antialiased font-body"
      >
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteFrame>{children}</SiteFrame>
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/brand/ScriptFXLogo.svg` }, { "@type": "WebSite", name: site.name, url: site.url, description: site.description }] }).replace(/</g, "\\u003c") }} />

        <DesignProvider />

        {/* Film grain layer above all content */}
        <GrainOverlay />
      </body>
    </html>
  );
}
