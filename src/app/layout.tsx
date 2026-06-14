import type { Metadata, Viewport } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Chiti Console — Operations Dashboard",
  description: "Unified operations dashboard for Chiti Technologies projects.",
};

export const viewport: Viewport = {
  themeColor: "#0f0f1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-dark text-text-main font-body antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
