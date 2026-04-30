const fs = require('fs');
const path = require('path');

const file = path.resolve('app/(dashboard)/dashboard/pools/daily-earning/DailyEarningPageContent.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Rename "Direct Partners Hierarchy" -> "Your Referral Earnings Overview"
content = content.replace(
    '<h2 className="text-2xl font-black text-foreground font-serif tracking-tight">Direct Partners Hierarchy</h2>',
    '<h2 className="text-2xl font-black text-foreground font-serif tracking-tight">Your Referral Earnings Overview</h2>'
);

// Update description
content = content.replace(
    '<p className="text-sm font-bold text-muted-foreground/70 mt-2 max-w-md">Comprehensive visualization of your direct downline, active capital allocations, and generated yields.</p>',
    '<p className="text-sm font-bold text-muted-foreground/70 mt-2 max-w-md">People you invited and the earnings generated through your referrals.</p>'
);

// 2. Add Pending Earnings to the top Grid
// Current: `totalReferralEarnings` and `active partners`
const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-card border-2 border-border/60 p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden group transition-all hover:border-indigo-500/30">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <CurrencyDollarIcon className="w-32 h-32 text-emerald-500" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" /> Referral Yield Generated
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">
                    {formatCurrency(totalReferralEarnings)}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/60 mt-3 uppercase tracking-wider">Lifetime commission network</p>
               </div>`;

const newGrid = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-card border-2 border-emerald-500/20 p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden group transition-all hover:border-emerald-500/40">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <CurrencyDollarIcon className="w-32 h-32 text-emerald-500" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" /> Total Settled Earnings
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">
                    {formatCurrency(data?.totalSettledEarnings || 0)}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/60 mt-3 uppercase tracking-wider">Already credited to wallet</p>
               </div>
               
               <div className="bg-card border-2 border-amber-500/20 p-8 rounded-[2rem] shadow-xl shadow-black/5 relative overflow-hidden group transition-all hover:border-amber-500/40">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                     <CurrencyDollarIcon className="w-32 h-32 text-amber-500" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" /> Total Pending Earnings
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-black text-foreground font-serif tracking-tighter tabular-nums drop-shadow-sm">
                    {formatCurrency(data?.totalPendingEarnings || 0)}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground/60 mt-3 uppercase tracking-wider">Settles at 30-day expiry</p>
               </div>`;

content = content.replace(oldGrid, newGrid);

// 3. Update Mobile Card (Lines 600+)
const oldMobileYieldBlock = `<div className="flex flex-col gap-2">
                                    <p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-2xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                      +{formatCurrency(ref.earningsGenerated)}
                                    </p>
                                    <span className="w-fit px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 shadow-sm">
                                      Settled Daily
                                    </span>
                                 </div>`;
                                 
const newMobileYieldBlock = `<div className="flex flex-col gap-2">
                                    <p className="font-black text-amber-600 dark:text-amber-500 font-serif text-2xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                      +{formatCurrency(ref.pendingEarningsGenerated)}
                                    </p>
                                    <span className="w-fit px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-sm">
                                      Pending (Settles 30 Days)
                                    </span>
                                    {ref.settledEarningsGenerated > 0 && (
                                       <p className="text-[10px] font-bold text-muted-foreground mt-1">Already Settled: {formatCurrency(ref.settledEarningsGenerated)}</p>
                                    )}
                                 </div>`;
content = content.replace(oldMobileYieldBlock, newMobileYieldBlock);

// 4. Update Desktop Table Headers
content = content.replace(
    '<th className="px-12 py-7">Total Settled to Wallet</th>',
    '<th className="px-12 py-7">Accumulated Pending Earnings</th>'
);

// 5. Update Desktop Table Cells
const oldDesktopYieldBlock = `<div className="flex flex-col gap-2">
                                       <p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                         +{formatCurrency(ref.earningsGenerated)}
                                       </p>
                                       <span className="w-fit px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 shadow-sm">
                                         Settled Daily
                                       </span>
                                    </div>`;

const newDesktopYieldBlock = `<div className="flex flex-col gap-2">
                                       <p className="font-black text-amber-600 dark:text-amber-500 font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                         +{formatCurrency(ref.pendingEarningsGenerated)}
                                       </p>
                                       <span className="w-fit px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-sm">
                                         Pending (Settles 30 Days)
                                       </span>
                                    </div>`;

content = content.replace(oldDesktopYieldBlock, newDesktopYieldBlock);

// 6. Fix useFetch missing variables (const totalReferralEarnings = data?.totalReferralEarnings || 0)
content = content.replace(
    'const totalReferralEarnings = data?.totalReferralEarnings || 0',
    'const totalReferralEarnings = data?.totalReferralEarnings || 0\n  const totalSettledEarnings = data?.totalSettledEarnings || 0\n  const totalPendingEarnings = data?.totalPendingEarnings || 0'
);

fs.writeFileSync(file, content, 'utf8');
console.log("UI replace completed.");
