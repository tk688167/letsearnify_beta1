import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WelcomeSlider from "@/app/components/WelcomeSlider";
import { CompanyPools } from "@/app/(dashboard)/dashboard/CompanyPools";
import CbspSection from "@/app/components/welcome/CbspSection";
import EcosystemSection from "@/app/components/welcome/EcosystemSection";
import FutureProjectsSection from "@/app/components/welcome/FutureProjectsSection";
import WelcomeHero from "@/app/components/welcome/WelcomeHero";
import React from "react";
import { getSocialProofStats, getPayoutProofs } from "@/app/actions/admin/social-proof";
import SocialProofStats from "@/app/components/ui/SocialProofStats";
import PayoutsCarousel from "@/app/components/ui/PayoutsCarousel";

export const metadata = {
  title: "Welcome - Let'sEarnify",
  description: "Welcome to Let'sEarnify - Explore our earning pools, tasks, marketplace, and future gaming projects.",
};

export default async function WelcomePage() {
  const session = await auth();
  let pools: any[] = [], user: any = null, stats: any = null, proofs: any[] = [];

  try {
      // Parallel data fetching
      const results = await Promise.all([
          prisma.pool.findMany(),
          session?.user ? prisma.user.findUnique({
              where: { id: session.user.id },
              select: { name: true, createdAt: true, tier: true, totalDeposit: true }
          }) : null,
          getSocialProofStats(),
          getPayoutProofs()
      ]);
      
      [pools, user, stats, proofs] = results;

  } catch (error) {
      console.error("⚠️ Welcome Page Offline Mode:", error);
      // Mock Data
      pools = [];
      user = session?.user ? { 
          name: session.user.name, 
          createdAt: new Date(), 
          tier: "NEWBIE", 
          totalDeposit: 0 
      } : null;
      stats = { 
          totalPaid: 15420, 
          activeMembers: 1250, 
          countries: 45 
      };
      proofs = [];
  }

  return (
    <main className="min-h-screen bg-white">
        
        {/* 1. Executive Hero */}
        <WelcomeHero user={user} />

        {/* 2. Live Ticker / Status Strip */}
        <div className="border-t border-b border-gray-100 bg-gray-50/50">
           <WelcomeSlider />
        </div>

        {/* --- STATS SECTION --- */}
        <div className="bg-white">
            <SocialProofStats stats={stats} />
        </div>

        {/* 3. The Ecosystem Grid */}
        <div id="ecosystem">
            <EcosystemSection />
        </div>

        {/* 4. Live Market (Pools) */}
        <section className="py-20 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 flex items-end justify-between">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Live Markets</h2>
                        <p className="text-gray-500 max-w-xl">Real-time opportunities. Capital allocation across our secure automated pools.</p>
                     </div>
                     <div className="hidden md:block px-4 py-2 bg-white rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                        Market Status: <span className="text-emerald-600">Open & Active</span>
                     </div>
                </div>
                <CompanyPools pools={pools} userTier={user?.tier} />
            </div>
        </section>
        
        {/* --- PAYOUT PROOFS --- */}
        <PayoutsCarousel proofs={proofs} />

        {/* 5. Deep Dive (CBSP) */}
        <section className="py-20 bg-white">
           <div className="max-w-7xl mx-auto px-6">
               <CbspSection user={user} />
           </div>
        </section>

        {/* 6. Innovation Hub (Future) */}
        <FutureProjectsSection />
        
    </main>
  );
}
