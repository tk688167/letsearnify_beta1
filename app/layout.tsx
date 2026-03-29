import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Tracker } from "./components/Tracker";
import BackButton from "./components/BackButton";
import ScrollToTop from "./components/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Let'$Earnify - Financial Freedom Platform",
  description: "Join the ultimate platform for micro-tasks, freelancing, and ethical investment pools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        <ScrollToTop />
        <BackButton />
        {children}
        <Tracker />
        <SpeedInsights />
      </body>
    </html>
  );
}
