export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WelcomeSlider from "@/app/components/WelcomeSlider";

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
  let user: any = null, stats: any = null, proofs: any[] = [];

  try {
      // Parallel data fetching
      const results = await Promise.all([

          session?.user ? prisma.user.findUnique({
              where: { id: session.user.id },
              select: { name: true, createdAt: true, tier: true, totalDeposit: true }
          }) : null,
          getSocialProofStats(),
          getPayoutProofs()
      ]);
      
      [user, stats, proofs] = results;

  } catch (error) {
      console.error("⚠️ Welcome Page Offline Mode:", error);
      // Mock Data

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
