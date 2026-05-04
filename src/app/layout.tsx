import type { Metadata } from "next";
import { Share_Tech_Mono, Outfit } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech",
  subsets: ["latin"],
});

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GGICAS — Global Geopolitical Intelligence",
  description:
    "Global Geopolitical Intelligence & Conflict Analysis System — Interactive world map, analytics, and database management.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body
        className="h-full flex flex-col text-[#f0f0ff] selection:bg-violet-500/40 selection:text-white"
        style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
