import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { LockOpenIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export const dynamic = 'force-dynamic'

type UnlockActivationRecord = {
  id: string;
  amount: number;
  achievementPool: number;
  referrals: number;
  cbsp: number;
  royalty: number;
  company: number;
  createdAt: Date;
  user?: { name: string | null; email: string | null; memberId: string; isActiveMember?: boolean } | null;
  isActiveMember?: boolean; // Added for search results
  isLocked?: boolean; // True if searched user has no activation
}

export default async function AdminUnlocksPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const query = searchParams?.q?.trim() || "";

  let displayRecords: UnlockActivationRecord[] = [];
  let totalFees = 0, totalAchievement = 0, totalReferral = 0, totalCbsp = 0, totalRoyalty = 0, totalCompany = 0;

  if (query) {
    // SEARCH MODE: Fetch Users matching query
    const numericPart = query.replace(/^LEU-/i, '');
    const isMemberIdQuery = query && !isNaN(parseInt(numericPart));
    
    const whereClause = isMemberIdQuery ? {
      OR: [
         { memberId: { contains: numericPart } },
         { name: { contains: query, mode: 'insensitive' as const } },
         { email: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {
      OR: [
         { name: { contains: query, mode: 'insensitive' as const } },
         { email: { contains: query, mode: 'insensitive' as const } },
         { memberId: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    const users = await prisma.user.findMany({
       where: whereClause,
       take: 50,
       include: {
         // @ts-ignore
         unlockActivations: {
            orderBy: { createdAt: 'desc' },
            take: 1
         }
       }
    } as any);

    displayRecords = users.map((u: any) => {
      const act = u.unlockActivations?.[0];
      if (act) {
         return {
            ...act,
            user: { name: u.name, email: u.email, memberId: u.memberId, isActiveMember: u.isActiveMember },
            isActiveMember: u.isActiveMember,
            isLocked: false
         } as UnlockActivationRecord;
      } else {
         return {
            id: u.id,
            amount: 0,
            achievementPool: 0,
            referrals: 0,
            cbsp: 0,
            royalty: 0,
            company: 0,
            createdAt: u.createdAt, // Fallback to user creation date
            user: { name: u.name, email: u.email, memberId: u.memberId, isActiveMember: u.isActiveMember },
            isActiveMember: u.isActiveMember,
            isLocked: true
         } as UnlockActivationRecord;
      }
    });

  } else {
    // DEFAULT MODE: Fetch Recent Activations
    // @ts-ignore
    const unlockActivations: UnlockActivationRecord[] = await prisma.unlockActivation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            memberId: true,
            isActiveMember: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    
    displayRecords = unlockActivations.map(act => ({
        ...act,
        isActiveMember: true,
        isLocked: false
    }));
  }

  // Calculate Aggregates (Only for the viewed records)
  totalFees = displayRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  totalAchievement = displayRecords.reduce((acc, curr) => acc + (curr.achievementPool || 0), 0)
  totalReferral = displayRecords.reduce((acc, curr) => acc + (curr.referrals || 0), 0)
  totalCbsp = displayRecords.reduce((acc, curr) => acc + (curr.cbsp || 0), 0)
  totalRoyalty = displayRecords.reduce((acc, curr) => acc + (curr.royalty || 0), 0)
  totalCompany = displayRecords.reduce((acc, curr) => acc + (curr.company || 0), 0)

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-3xl font-bold font-serif text-foreground tracking-tight flex items-center gap-3">
               <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-500">
                  <LockOpenIcon className="w-8 h-8" />
               </div>
               Manual Unlock Distributions
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
               View the transaction history and exact fund distributions of all users who have manually paid the $1 fee to unlock their accounts.
            </p>
         </div>

         <div className="w-full md:w-auto">
            <form method="GET" action="/admin/unlocks" className="flex items-center gap-2 relative">
               <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 text-muted-foreground" />
               <input 
                  type="text" 
                  name="q" 
                  defaultValue={query} 
                  placeholder="Search by name, email, or LEU-ID..." 
                  className="pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-72 transition-all shadow-sm"
               />
               <button type="submit" className="bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-foreground/90 transition-colors">
                  Search
               </button>
               {query && (
                  <Link href="/admin/unlocks" className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors border border-transparent hover:border-border">
                     <XMarkIcon className="w-5 h-5" />
                  </Link>
               )}
            </form>
         </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Fees ($1)</p>
            <p className="text-2xl font-black text-blue-600">${formatCurrency(totalFees)}</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Achievement</p>
            <p className="text-2xl font-black text-amber-500">${formatCurrency(totalAchievement)}</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Referrals</p>
            <p className="text-2xl font-black text-purple-500">${formatCurrency(totalReferral)}</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">CBSP (Setup)</p>
            <p className="text-2xl font-black text-gray-500">${formatCurrency(totalCbsp)}</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Royalty (Setup)</p>
            <p className="text-2xl font-black text-gray-500">${formatCurrency(totalRoyalty)}</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Company</p>
            <p className="text-2xl font-black text-emerald-500">${formatCurrency(totalCompany)}</p>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px]">User</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-center">Status</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Fee ($1)</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Achv. Pool</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Referral</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">CBSP</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Royalty</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px] text-right">Company Net</th>
                <th className="px-6 py-4 font-bold text-muted-foreground tracking-wider uppercase text-[10px]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    {query ? "No users found matching your search." : "No manual unlock distributions found."}
                  </td>
                </tr>
              ) : (
                displayRecords.map((activation) => (
                  <tr key={activation.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{activation.user?.name || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground">{activation.user?.email || "No Email"}</div>
                      <div className="text-[9px] font-mono text-muted-foreground opacity-50">ID: {activation.user?.memberId}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {activation.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                             Locked
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                             Unlocked
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${activation.isLocked ? 'text-muted-foreground opacity-50' : 'text-blue-600'}`}>
                         ${formatCurrency(activation.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${activation.isLocked ? 'text-muted-foreground opacity-50' : 'text-amber-500'}`}>
                         ${formatCurrency(activation.achievementPool)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${activation.isLocked ? 'text-muted-foreground opacity-50' : 'text-purple-500'}`}>
                         ${formatCurrency(activation.referrals)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-500">
                         {activation.cbsp > 0 ? `$${formatCurrency(activation.cbsp)}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-500">
                         {activation.royalty > 0 ? `$${formatCurrency(activation.royalty)}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${activation.isLocked ? 'text-muted-foreground opacity-50' : 'text-emerald-500'}`}>
                         ${formatCurrency(activation.company)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {activation.isLocked ? (
                         <span className="text-muted-foreground/50 italic">N/A</span>
                      ) : (
                         <>
                            {new Date(activation.createdAt).toLocaleDateString()}
                            <span className="block text-[10px] opacity-70">{new Date(activation.createdAt).toLocaleTimeString()}</span>
                         </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
