import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is the brand fallback. To use TASA Orbiter, drop the font files into
// public/fonts and switch to next/font/local — see public/fonts/README.md.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cybernet Stock Tracker",
  description:
    "Track Cybernet IT hardware stock — what we hold, where it is, and why.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-background text-carbon">
        {children}
      </body>
    </html>
  );
}
