import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Authprovider from "@/providers/auth-provider";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "FlagForge - The Ultimate CTF Platform",
    template: "%s | FlagForge",
  },
  description:
    "Join FlagForge, the premier CTF platform to hone your cybersecurity skills with engaging challenges. Compete, learn, and grow your hacking expertise.",
  metadataBase: new URL("https://flagforgectf.com"),
  applicationName: "FlagForge CTF",
  referrer: "origin-when-cross-origin",
  keywords: [
    "CTF",
    "Capture The Flag",
    "Cybersecurity",
    "Ethical Hacking",
    "FlagForge",
    "CTF Challenges",
    "Cybersecurity Platform",
    "Online CTF Competitions",
    "Nepal cybersecurity",
    "Nepal CTF platform",
  ],
  authors: [{ name: "@Aryanstha", url: "https://github.com/aryan4859" }],
  publisher: "FlagForge",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-2506540900080142",
  },
  openGraph: {
    title: "FlagForge - The Ultimate CTF Platform",
    description:
      "FlagForge is the go-to platform for Capture The Flag (CTF) competitions. Test your hacking skills with thrilling challenges in cybersecurity.",
    url: "https://flagforgectf.com",
    siteName: "FlagForge",
    images: [
      {
        url: "/flagforge.gif",
        width: 1200,
        height: 630,
        alt: "FlagForge - Capture The Flag Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Aryanstha",
    title: "FlagForge - The Ultimate CTF Platform",
    description:
      "Join FlagForge, the leading Capture The Flag platform to enhance your cybersecurity skills. Compete and learn with exciting CTF challenges.",
    images: ["/flagforge.gif"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://flagforgectf.com/#website",
      url: "https://flagforgectf.com",
      name: "FlagForge",
      alternateName: "FlagForge CTF Platform",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://flagforgectf.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@id": "https://flagforgectf.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://flagforgectf.com/#organization",
      name: "FlagForge",
      url: "https://flagforgectf.com",
      logo: {
        "@type": "ImageObject",
        url: "https://flagforgectf.com/flagforge-logo.png",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved/system theme before first paint to avoid a light-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("flagforge-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`,
          }}
        />
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${dmSans.className} antialiased transition-colors duration-300 bg-white dark:bg-gray-900 overflow-x-hidden sm:overflow-x-visible`}
      >
        <ThemeProvider>
          <Authprovider>
            <div className="mx-auto grid min-h-[100dvh] grid-rows-[auto_1fr_auto]">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Analytics />
              <CookieConsent />
              <Footer />
            </div>
          </Authprovider>
        </ThemeProvider>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2506540900080142"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
