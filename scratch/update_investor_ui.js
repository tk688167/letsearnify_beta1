const fs = require('fs');
const path = require('path');

const file = path.resolve('app/(dashboard)/dashboard/pools/daily-earning/DailyEarningPageContent.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add totalPendingInvestorProfit variable near dailyEarningWallet
content = content.replace(
    'const dailyEarningWallet = data?.dailyEarningWallet || 0\n  const activeInvestments: any[] = data?.activeInvestments || []',
    'const dailyEarningWallet = data?.dailyEarningWallet || 0\n  const totalPendingInvestorProfit = data?.totalPendingProfit || 0\n  const activeInvestments: any[] = data?.activeInvestments || []'
);

// 2. Replace the "Total Profit" card with "Settled Wallet" and "Pending Profit"
// Wait, the grid has `grid-cols-2`. If I add a 3rd block, it might wrap weirdly or I should change to `grid-cols-3`.
// Let's change the container: `<div className="shrink-0 grid grid-cols-2 gap-3 w-full lg:w-auto">`
// To: `<div className="shrink-0 grid grid-cols-3 gap-3 w-full lg:w-auto">`

const oldGridStart = `<div className="shrink-0 grid grid-cols-2 gap-3 w-full lg:w-auto">`;
const newGridStart = `<div className="shrink-0 grid grid-cols-3 gap-3 w-full lg:w-auto">`;
content = content.replace(oldGridStart, newGridStart);

const oldTotalProfitBlock = `<div className="bg-emerald-500/5 border border-emerald-500/20 p-3 sm:p-4 rounded-xl flex-1 text-center flex flex-col justify-center min-w-0">
               <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 shrink-0">
                 <ChartBarIcon className="w-4 h-4" />
               </div>
               <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 whitespace-nowrap">Total Profit</p>
               <p className="font-sans font-black text-emerald-600 dark:text-emerald-500 text-lg sm:text-xl truncate max-w-full leading-none tabular-nums">+{formatCurrency(totalAccumulatedProfit)}</p>
             </div>`;

const newCards = `<div className="bg-emerald-500/5 border border-emerald-500/20 p-3 sm:p-4 rounded-xl flex-1 text-center flex flex-col justify-center min-w-0">
               <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 shrink-0">
                 <WalletIcon className="w-4 h-4" />
               </div>
               <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 whitespace-nowrap">Settled Wallet</p>
               <p className="font-sans font-black text-emerald-600 dark:text-emerald-500 text-lg sm:text-xl truncate max-w-full leading-none tabular-nums">{formatCurrency(dailyEarningWallet)}</p>
             </div>
             
             <div className="bg-amber-500/5 border border-amber-500/20 p-3 sm:p-4 rounded-xl flex-1 text-center flex flex-col justify-center min-w-0">
               <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 shrink-0">
                 <ChartBarIcon className="w-4 h-4" />
               </div>
               <p className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 whitespace-nowrap">Pending Profit</p>
               <p className="font-sans font-black text-amber-600 dark:text-amber-500 text-lg sm:text-xl truncate max-w-full leading-none tabular-nums">+{formatCurrency(totalPendingInvestorProfit)}</p>
             </div>`;

content = content.replace(oldTotalProfitBlock, newCards);

// We need to import WalletIcon if it's not imported.
// It might be imported already. If not, it might throw an error.
// Let's replace WalletIcon with CurrencyDollarIcon which is definitely imported.
content = content.replace('<WalletIcon className="w-4 h-4" />', '<CurrencyDollarIcon className="w-4 h-4" />');

// 3. Update Individual Pool Cards to show Pending Profit instead of Generated Profit.
// In PoolCard component, search for: `Generated Profit`
// The PoolCard code might be at the bottom of the file.
const oldPoolGeneratedLabel = `<p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 truncate">Generated Profit</p>`;
const newPoolGeneratedLabel = `<p className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 truncate">Pending Profit</p>`;
content = content.replace(oldPoolGeneratedLabel, newPoolGeneratedLabel);

const oldPoolGeneratedValue = `<p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-500 tabular-nums">+{formatCurrency(inv.profitEarned)}</p>`;
const newPoolGeneratedValue = `<p className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-500 tabular-nums">+{formatCurrency(inv.pendingInvestorProfit || 0)}</p>`;
content = content.replace(oldPoolGeneratedValue, newPoolGeneratedValue);

fs.writeFileSync(file, content, 'utf8');
console.log("Investor UI replaced.");
