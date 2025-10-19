import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextOS - Web-Based Operating System",
  description: "A complete web-based operating system built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
