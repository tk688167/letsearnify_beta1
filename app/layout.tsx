import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Tracker } from "./components/Tracker";
import BackButton from "./components/BackButton";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import CookieConsent from "./components/ui/CookieConsent";
import { ThemeProvider } from "./components/theme-provider";
import { Suspense } from "react";
import RouteLoader from "./components/RouteLoader";
import SupportWidget from "./components/layout/SupportWidget";
import NextAuthProvider from "./components/providers/NextAuthProvider";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // ─── Layer 1: Freeze window.ethereum before MetaMask can inject ───────────
                // Object.defineProperty runs before any extension content-script can
                // overwrite the property because this script is synchronous and inline.
                try {
                  Object.defineProperty(window, 'ethereum', {
                    get: function() { return undefined; },
                    set: function() { /* ignore any provider injection */ },
                    configurable: false
                  });
                } catch(e) { /* property already defined — safe to ignore */ }

                // ─── Layer 2: Drop EIP-6963 multi-wallet provider announcements ───────────
                // MetaMask (and other wallets) fire 'eip6963:announceProvider' events.
                // Override addEventListener to silently swallow those events.
                var _origAddEventListener = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type) {
                  if (type === 'eip6963:announceProvider') return;
                  return _origAddEventListener.apply(this, arguments);
                };

                // ─── Layer 3: Filter extension-originated console noise ───────────────────
                var BLOCKED_PATTERNS = [
                  'MetaMask', 'metamask', 'chrome-extension', 'Failed to connect',
                  'ethereum', 'window.ethereum', 'provider', 'inpage.js'
                ];
                var _origConsoleError = console.error;
                console.error = function() {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  for (var i = 0; i < BLOCKED_PATTERNS.length; i++) {
                    if (msg.indexOf(BLOCKED_PATTERNS[i]) !== -1) return;
                  }
                  return _origConsoleError.apply(console, arguments);
                };
                var _origConsoleWarn = console.warn;
                console.warn = function() {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  for (var i = 0; i < BLOCKED_PATTERNS.length; i++) {
                    if (msg.indexOf(BLOCKED_PATTERNS[i]) !== -1) return;
                  }
                  return _origConsoleWarn.apply(console, arguments);
                };

                // ─── Layer 4: Suppress unhandledrejection / error events ─────────────────
                window.addEventListener('unhandledrejection', function(event) {
                  var msg = (event.reason && event.reason.message) ? event.reason.message : String(event.reason);
                  if (msg.indexOf('MetaMask') !== -1 || msg.indexOf('ethereum') !== -1 || msg.indexOf('provider') !== -1) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('error', function(event) {
                  var src = (event.filename || '');
                  var msg = (event.message || '');
                  if (src.indexOf('chrome-extension') !== -1 || msg.indexOf('MetaMask') !== -1) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
              })();
            `
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground`}
      >
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              <RouteLoader />
            </Suspense>
            <ScrollToTop />
            <BackButton />
            <Suspense fallback={null}>
              <SupportWidget />
            </Suspense>
            <Toaster position="top-center" />
            {/* <CookieConsent /> */}
            {children}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Tracker />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}