import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAHandler from "@/components/PWAHandler";
import I18nProvider from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: "NextOS - Web-Based Operating System",
  description: "A complete web-based operating system built with Next.js and TypeScript",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NextOS",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0070f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <I18nProvider>
          <PWAHandler />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
