"use client";

import React from "react";
import { motion } from "framer-motion";
import LandingHeader from "../../components/LandingHeader";
import Footer from "../layout/Footer";
import {
  LockClosedIcon,
  EyeIcon,
  CircleStackIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";

export default function PrivacyPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingHeader />

      <main className="flex-1 pt-20 pb-20 sm:pt-24 sm:pb-24 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
          <div className="absolute top-[15%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-fuchsia-500/10 dark:bg-fuchsia-500/10 rounded-full blur-[80px] sm:blur-[120px] mix-blend-normal dark:mix-blend-screen" />
        </div>

        {/* Page Header */}
        <section className="pt-4 pb-10 sm:pt-8 sm:pb-16 px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-black text-foreground mb-3 sm:mb-6 tracking-tight"
            >
              Privacy Is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                Not an Option.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[13px] sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1 sm:px-2"
            >
              It’s a fundamental right. We collect only what is strictly
              necessary and never sell your personal data.
            </motion.p>
          </div>
        </section>

        {/* Highlight Cards */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem]  border border-border/60 dark:border-white/5 shadow-sm group hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <LockClosedIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  1. Data Collection
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                We collect minimal identity and financial data strictly required
                to process legitimate transactions and handle compliance.{" "}
                <strong className="text-foreground">
                  We never store plaintext passwords or credit details.
                </strong>
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem] border border-border/60 dark:border-white/5 shadow-lg group hover:border-fuchsia-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <EyeIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  2. Zero Selling
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                Your data is exclusively used to secure your account and send
                essential alerts.{" "}
                <strong className="text-foreground">
                  We explicitly promise to never sell your personal data
                </strong>{" "}
                to advertisers or third‑party networks.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem]  border border-border/60 dark:border-white/5 shadow-lg group hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CircleStackIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  3. Data Security
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                Sensitive data is encrypted end‑to‑end using AES‑256 protocols,
                both at rest and in transit. Strict internal checks and
                automated backups prevent unauthorized breaches.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-slate-50 dark:bg-[#060e28] p-5 sm:p-8 rounded-[1.25rem]  border border-border/60 dark:border-white/5 shadow-lg group hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ServerIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  4. Your Data Rights
                </h2>
              </div>
              <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">
                You exercise full control over your digital footprint. You have
                the total right to access, correct, or request the permanent
                deletion of your account and its ledger associations.
              </p>
            </motion.div>
          </div>

          {/* --- FULL DETAILED POLICY SECTION (human‑written content) --- */}
          <div className="mt-14 sm:mt-20">
            <div className="bg-slate-50 dark:bg-[#060e28] p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-border/60 dark:border-white/5 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 sm:mb-8 tracking-tight">
                Our Full Privacy &amp; Security Commitment
              </h2>

              <div className="space-y-8 text-muted-foreground text-[15px] sm:text-base leading-relaxed">
                {/* --- Account Security --- */}
                <section>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Account Security and User Authentication
                  </h3>
                  <p>
                    We are committed to safeguarding your account with advanced
                    security protocols. Our platform employs multi‑factor
                    authentication (MFA) and continuous real‑time login
                    monitoring to detect and prevent unauthorized access.
                    Whenever you perform sensitive actions—such as changing your
                    password or updating personal information—we require
                    additional verification steps to ensure only you have
                    control over your account.
                  </p>
                </section>

                {/* --- Data Encryption --- */}
                <section>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Data Encryption and Privacy Protection
                  </h3>
                  <p>
                    We protect your personal information by employing
                    industry‑leading encryption standards. All data is encrypted
                    both while stored (at rest) and during transmission (in
                    transit) using AES‑256 encryption—the same level of security
                    trusted by global financial institutions. Passwords are
                    always securely hashed and never stored in plain text,
                    ensuring your credentials remain confidential at all times.
                  </p>
                </section>

                {/* --- Infrastructure Security --- */}
                <section>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Infrastructure Security and System Reliability
                  </h3>
                  <p>
                    Our services are hosted in world‑class, resilient data
                    centers that are continuously monitored around the clock. We
                    implement robust endpoint security, advanced DDoS mitigation
                    strategies, and automated daily backups to protect against
                    data loss or disruption. Our infrastructure is designed for
                    high availability and reliability, ensuring a consistent
                    99.9% uptime for our users.
                  </p>
                </section>

                {/* --- Financial Security --- */}
                <section>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Financial Security and Fraud Prevention
                  </h3>
                  <p>
                    To safeguard your financial assets, we utilize secure cold
                    storage environments for the majority of funds, isolating
                    them from online threats. All financial transactions are
                    subject to rigorous internal controls, combining both manual
                    oversight and automated monitoring to detect and prevent any
                    signs of fraudulent activity. We are dedicated to protecting
                    your funds with the highest level of diligence and oversight.
                  </p>
                </section>

                <hr className="border-border/40 my-6" />

                {/* --- Privacy Policy (from second document) --- */}
                <section>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Privacy Policy
                  </h3>
                  <p className="mb-4">
                    At LetsEarnify, your privacy is our highest priority. We are
                    committed to maintaining transparency in how we collect,
                    use, and protect your personal information. We strictly
                    collect only the information essential to operate our
                    platform efficiently, and{" "}
                    <strong className="text-foreground">
                      we will never sell your personal information to third
                      parties under any circumstances.
                    </strong>
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mt-4 mb-1">
                    Information We Collect
                  </h4>
                  <p>
                    To create and maintain your account, we may collect the
                    following personal information:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Email address</li>
                    <li>Country of residence</li>
                    <li>Encrypted password</li>
                    <li>Ledger and transaction history</li>
                  </ul>
                  <p className="mt-2">
                    We do not use external tracking technologies such as
                    third‑party cookies or analytics tools that monitor your
                    activity outside our platform.
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mt-4 mb-1">
                    How We Use Your Information
                  </h4>
                  <p>
                    We use your information solely to:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Authenticate your identity and secure your account</li>
                    <li>Process legitimate transactions and withdrawal requests</li>
                    <li>
                      Notify you about important account activities or security
                      alerts
                    </li>
                  </ul>
                  <p className="mt-2">
                    Your personal data is never used for advertising purposes or
                    shared for marketing without your consent.
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mt-4 mb-1">
                    Data Sharing and Disclosure
                  </h4>
                  <p>
                    We may share certain essential information with trusted
                    third‑party service providers, such as payment gateways,
                    solely to facilitate transactions you authorize. This data
                    is transmitted securely using encrypted APIs and is never
                    sold or disclosed for unrelated purposes. In all cases, we
                    ensure that our partners uphold strict confidentiality and
                    data protection standards.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}