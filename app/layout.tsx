import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Tracker } from "./components/Tracker";
import BackButton from "./components/BackButton";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import CookieConsent from "./components/ui/CookieConsent";
import { ThemeProvider } from "./components/theme-provider";

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
  metadataBase: new URL('https://www.letsearnify.com'),
  title: {
    default: "Let'$Earnify (LADS) - Earn Online Rewards & Freelancing",
    template: "%s | Let'$Earnify (LADS)"
  },
  description: "Join LetsEarnify (LADS) - The trusted platform to earn money online. Complete tasks, offer freelance services, and get paid daily. Sign up for free.",
  keywords: ["LetsEarnify", "LADS", "earn online rewards", "earn money online", "referral program", "crypto investments", "freelancing", "micro tasks", "trusted payouts", "mudaraba"],
  authors: [{ name: "LetsEarnify Team" }],
  creator: "LetsEarnify",
  publisher: "LetsEarnify",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Let'$Earnify - Financial Freedom Platform",
    description: "Your gateway to digital wealth. Tasks, Freelancing, and Ethical Investments in one ecosystem.",
    url: 'https://www.letsearnify.com',
    siteName: "Let'$Earnify",
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Let'$Earnify - Earn, Invest, Grow",
    description: "The all-in-one platform for digital earning. Join thousands of users today.",
    creator: '@LetsEarnify',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// Organization Schema for JSON-LD
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: "LetsEarnify",
  alternateName: "L-E-T-S Earnify",
  url: 'https://www.letsearnify.com',
  logo: 'https://www.letsearnify.com/logo.jpg',
  sameAs: [
    'https://twitter.com/LetsEarnify',
    'https://facebook.com/LetsEarnify',
    'https://instagram.com/LetsEarnify',
    'https://linkedin.com/company/letsearnify'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '',
    contactType: 'customer support',
    email: 'support@letsearnify.com',
    availableLanguage: 'English'
  },
  description: "The trusted digital ecosystem for earning online rewards, freelancing, and ethical investments."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollToTop />
          <BackButton />
          <Toaster position="top-center" />
          {/* <CookieConsent /> */}
          {children}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Tracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
