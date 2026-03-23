import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearMind PDF - Free PDF to Markdown Converter | AI-Ready Notes",
  description: "Convert PDF to structured Markdown in seconds. Free, fast, and AI-ready. Perfect for Obsidian, Notion users, researchers, and content creators.",
  keywords: ["PDF to Markdown", "PDF converter", "PDF to text", "Markdown converter", "PDF extraction", "AI notes", "Obsidian", "Notion", "free PDF tool"],
  authors: [{ name: "ClearMind PDF" }],
  creator: "ClearMind PDF",
  publisher: "ClearMind PDF",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_CN",
    url: "https://clearmindpdf.com",
    siteName: "ClearMind PDF",
    title: "ClearMind PDF - Free PDF to Markdown Converter",
    description: "Convert PDF to structured Markdown in seconds. Free, fast, and AI-ready. Perfect for Obsidian and Notion users.",
    images: [
      {
        url: "https://clearmindpdf.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClearMind PDF - PDF to Markdown Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearMind PDF - Free PDF to Markdown Converter",
    description: "Convert PDF to structured Markdown in seconds. Free, fast, and AI-ready.",
    images: ["https://clearmindpdf.com/og-image.png"],
    creator: "@clearmindpdf",
  },
  alternates: {
    canonical: "https://clearmindpdf.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google-site-verification" content="your-google-verification-code" />
      </head>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
