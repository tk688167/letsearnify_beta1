"use client"

import React from "react"
import LandingHeader from "../../components/LandingHeader"
import Footer from "../../components/Footer"
import InlineBackButton from "../ui/InlineBackButton"
import { ShieldCheckIcon, BanknotesIcon, UserGroupIcon, ExclamationTriangleIcon, DocumentCheckIcon, CreditCardIcon } from "@heroicons/react/24/outline"

export default function TermsPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingHeader />

      <main className="flex-1 pt-24 pb-24">
        
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6">
           <InlineBackButton />
        </div>

        {/* Page Header */}
        <section className="py-16 px-6 text-center">
           <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Terms & Disclosures</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                 A transparent guide to how we operate, how you earn, and the rules that keep our community safe.
              </p>
              <div className="mt-8 text-sm text-gray-400">
                 Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
           </div>
        </section>

        {/* content Area (Full Width, Vertical Scroll) */}
        <div className="max-w-4xl mx-auto px-6 space-y-16">
           
           {/* Introduction */}
           <SectionContainer icon={<DocumentCheckIcon className="w-8 h-8 text-indigo-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Introduction</h2>
              <p className="text-lg text-indigo-600 font-medium italic mb-6">"A foundation of trust for a sustainable partnership."</p>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    Welcome to LetsEarnify. By accessing our platform, creating an account, or using any of our services, you agree to comply with these terms. We have designed these rules not just to protect the company, but to ensure a fair and reliable environment for every user.
                 </p>
                 <p>
                    LetsEarnify operates as a digital services marketplace and community earning platform. We provide tools for users to earn through tasks, freelancing, and profit-sharing pools. We commit to operational transparency, ensuring you always understand how your earnings are generated.
                 </p>
              </div>
           </SectionContainer>

           {/* How You Earn */}
           <SectionContainer icon={<BanknotesIcon className="w-8 h-8 text-emerald-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How You Earn</h2>
              <p className="text-lg text-emerald-600 font-medium italic mb-6">"Real value creation, not guaranteed easy money."</p>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    We provide legitimate earning opportunities, but it is important to understand that income is never guaranteed without effort. Your earnings depend on the specific pillar you participate in:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                     <li><strong>Task Arbitrage:</strong> Compensation is strictly based on the successful validation of micro-tasks. Payments are held in escrow until verification is complete.</li>
                     <li><strong>Service Marketplace:</strong> An open exchange for digital services. LetsEarnify provides the dispute resolution framework and secure payment rails.</li>
                     <li><strong>Mudaraba Pools:</strong> Passive capital allocation. Funds are deployed into ecosystem liquidity and external arbitrage opportunities. Returns are calculated weekly based on realized profits, not fixed interest.</li>
                  </ul>
              </div>
           </SectionContainer>

           {/* Referral System */}
           <SectionContainer icon={<UserGroupIcon className="w-8 h-8 text-blue-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Referral System</h2>
              <p className="text-lg text-blue-600 font-medium italic mb-6">"Rewards for building a genuine community."</p>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    Our multi-tier referral system is designed to reward community building and mentorship. Commissions are generated only when your referrals actively engage with the platform (e.g., earning from tasks or entering pools). 
                 </p>
                 <p>
                    This is <strong>not</strong> a pyramid scheme where money is simply moved from new members to old ones. Value must be created for commissions to be paid. Creating multiple fake accounts to exploit the referral system is fraud and will lead to an immediate ban.
                 </p>
              </div>
           </SectionContainer>

           {/* User Conduct */}
           <SectionContainer icon={<ShieldCheckIcon className="w-8 h-8 text-purple-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">User Conduct</h2>
              <p className="text-lg text-purple-600 font-medium italic mb-6">"Fair play ensures a reliable platform for everyone."</p>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    To maintain the integrity of our ecosystem, we have a zero-tolerance policy for fraudulent activity. Prohibited actions include:
                 </p>
                 <ul className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
                    <li className="bg-gray-50 p-3 rounded-lg border border-gray-100">Using VPNs or proxies to falsify location data.</li>
                    <li className="bg-gray-50 p-3 rounded-lg border border-gray-100">Automating tasks with bots or scripts.</li>
                    <li className="bg-gray-50 p-3 rounded-lg border border-gray-100">Creating multiple accounts for self-referral.</li>
                    <li className="bg-gray-50 p-3 rounded-lg border border-gray-100">Harassing other users or support staff.</li>
                 </ul>
                 <p className="mt-4">
                    Violation of these rules will result in account suspension and the forfeiture of any accrued earnings.
                 </p>
              </div>
           </SectionContainer>

            {/* Fee Structure */}
            <SectionContainer icon={<CreditCardIcon className="w-8 h-8 text-pink-600" />}>
               <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Structure & Payments</h2>
               <p className="text-lg text-pink-600 font-medium italic mb-6">"One-time activation. Zero hidden monthly costs."</p>
               <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                  <p>
                     <strong>Activation Fee:</strong> A single, non-refundable fee of $1.00 USD is required to activate a fully functional account. This fee covers KYC processing, wallet initialization, and fraud prevention measures.
                  </p>
                  <p>
                     <strong>Platform Fees:</strong> We charge a small service fee (varying by asset class) on withdrawals to cover blockchain network costs and banking gateway charges. There are NO monthly subscription fees for maintaining an account.
                  </p>
               </div>
            </SectionContainer>

            {/* Withdrawal Policy */}
            <SectionContainer icon={<DocumentCheckIcon className="w-8 h-8 text-orange-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Policy</h2>
              <p className="text-lg text-orange-600 font-medium italic mb-6">"Secure, verified, and timely processing."</p>
              <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                 <p>
                    We prioritize the security of your funds. All withdrawal requests are processed within standard timeframes (typically 24-48 hours) to allow for security checks.
                 </p>
                 <p>
                    Minimum withdrawal thresholds apply to cover network fees (for crypto) or processing costs. We enforce a 24-hour cooldown period between withdrawals to prevent system abuse. Users are responsible for providing correct wallet addresses; lost funds due to incorrect details cannot be recovered.
                 </p>
              </div>
           </SectionContainer>

           {/* Risk Disclosure */}
           <SectionContainer icon={<ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Risk Disclosure</h2>
              <p className="text-lg text-amber-600 font-medium italic mb-6">"Understanding the realities of digital earning and investment."</p>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-4 text-amber-900">
                 <p>
                    <strong>Capital Risk:</strong> Participating in Mudaraba pools involves business risk. While we vet all ventures, profit is not guaranteed, and past performance does not predict future results.
                 </p>
                 <p>
                    <strong>Regulatory Compliance:</strong> Users are responsible for ensuring their use of the platform complies with local laws and regulations in their jurisdiction.
                 </p>
                 <p>
                    <strong>No Financial Advice:</strong> Content on this platform is for informational purposes only and should not be considered professional financial advice.
                 </p>
              </div>
           </SectionContainer>

        </div>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  )
}

function SectionContainer({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) {
   return (
      <section className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
         <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
            {icon}
         </div>
         {children}
      </section>
   )
}
