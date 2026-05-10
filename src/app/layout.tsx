import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";

/*
  Typography rationale:
  - Inter: functional, trusted in data products (Linear, Vercel, Stripe)
  - JetBrains Mono: technical precision for ISO codes, coordinates, data values
  Outfit was removed — it reads as a consumer/lifestyle app, not a geopolitical intelligence platform.
*/
const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GGICAS — Global Geopolitical Intelligence",
  description:
    "Global Geopolitical Intelligence & Conflict Analysis System — Interactive world map, conflict analysis, alliance mapping, and database management.",
  keywords: ["geopolitics", "conflict analysis", "arms trade", "sanctions", "intelligence"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        className="h-full flex flex-col"
        style={{
          fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
          color: "#e8edf4",
          /* Selection uses Prussian blue — consistent with brand */
          WebkitUserSelect: "auto",
        }}
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
