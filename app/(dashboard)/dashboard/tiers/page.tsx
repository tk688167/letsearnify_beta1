import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TierProgressView from "./tier-progress-view"
import { FeatureGuard } from "../FeatureGuard";

import { getTierRules, calculateQualifiedTierArn } from "@/lib/mlm"

export default async function TierPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  let user, tierConfig, totalEarnings = 0;
  let referralTree: any[] = [];
  let qualifiedTransactions: any[] = [];
  let qualifiedArn = 0;

  try {
      tierConfig = await getTierRules();
      
      const userId = session.user.id;

      // Parallel execution for performance
      const [dbUser, qArn, qTransactions] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            referrals: { // Level 1
              include: {
                referrals: { // Level 2
                  include: {
                    referrals: true // Level 3
                  }
                }
              }
            },
            referralsMade: { // Commissions
               orderBy: { createdAt: 'desc' },
               take: 50,
               include: {
                  sourceUser: {
                     select: { name: true, email: true }
                  }
               }
            }
          }
        }),
        calculateQualifiedTierArn(userId, prisma),
        prisma.transaction.findMany({
            where: {
                userId,
                status: "COMPLETED",
                OR: [
                    { type: "SIGNUP_BONUS" },
                    { type: "REFERRAL_COMMISSION" },
                    { type: "TASK_REWARD" },
                    { type: "DEPOSIT" },
                    { type: "REWARD", method: "SPIN" }
                ]
            },
            orderBy: { createdAt: "desc" },
            take: 100
        })
      ]);
      
      user = dbUser;
      qualifiedArn = qArn;
      qualifiedTransactions = qTransactions;
      
      if (user) {
          // Flatten the Tree
          user.referrals.forEach((l1: any) => {
            referralTree.push({ ...l1, level: 1 })
            l1.referrals.forEach((l2: any) => {
              referralTree.push({ ...l2, level: 2 })
              l2.referrals.forEach((l3: any) => {
                referralTree.push({ ...l3, level: 3 })
              })
            })
          })
          
           const totalEarningsAgg = await prisma.referralCommission.aggregate({
              where: { earnerId: user.id },
              _sum: { amount: true }
           })

           // Fetch absolute direct signup count for consistent tier calculation
           const dbTotalSignups = await prisma.user.count({
              where: { referredByCode: user.referralCode }
           });
           (user as any).totalSignups = dbTotalSignups;
       }
  } catch (error) {
      console.error("⚠️ Tiers Page Offline Mode:", error);
      tierConfig = { 
          NEWBIE: { arn: 0, directs: 0 }, 
          BRONZE: { arn: 400, directs: 40 }, 
          SILVER: { arn: 1000, directs: 100 }, 
          GOLD: { arn: 1800, directs: 250 }, 
          PLATINUM: { arn: 2700, directs: 500 }, 
          DIAMOND: { arn: 7000, directs: 1200 }, 
          EMERALD: { arn: 15000, directs: 2500 } 
      };
      user = {
          tier: "NEWBIE",
          balance: 0,
          arnBalance: 0,
          activeMembers: 0,
      } as any;
  }

  if (!user) redirect("/login")
  
  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-gray-50/50 dark:bg-gray-950 space-y-6 transition-colors duration-300">
         
         <TierProgressView 
            user={{ 
              tier: user.tier, 
              arnBalance: user.arnBalance || 0, // Keep original for reference
              qualifiedArn: qualifiedArn, // Use this for progress
              balance: user.balance || 0 
            }}
            stats={{ teamSize: referralTree.length, totalSignups: (user as any).totalSignups || 0 }}
            tierConfig={tierConfig}
            referralTree={referralTree}
            commissions={user.referralsMade || []}
            qualifiedTransactions={qualifiedTransactions}
         />

      </div>
  )
}
