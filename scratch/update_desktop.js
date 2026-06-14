const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/(dashboard)/dashboard/pools/daily-earning/DailyEarningPageContent.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace Header 1
content = content.replace(
    '<th className="px-12 py-7">Aggregated Share (20%)</th>',
    '<th className="px-12 py-7">Total Settled to Wallet</th>'
);

// Replace Header 2
content = content.replace(
    '<th className="px-12 py-7 text-right">Protocol Status</th>',
    '<th className="px-12 py-7 text-right">Daily Generation Status</th>'
);

// Replace the map function start
content = content.replace(
    'referralList.map((ref: any) => (',
    'referralList.map((ref: any) => {\n                               const dailyGeneration = ref.totalInvested * 0.01 * 0.20;\n                               return ('
);

// Replace Anonymous Member wrapper to include Source:
content = content.replace(
    '<p className="font-black text-foreground text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{ref.name || "Anonymous Member"}</p>',
    '<div className="flex items-center gap-2">\n                                             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Source:</p>\n                                             <p className="font-black text-foreground text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{ref.name || "Anonymous Member"}</p>\n                                          </div>'
);

// Replace Earnings cell wrapper
const oldEarningsBlock = `<p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                      +{formatCurrency(ref.earningsGenerated)}
                                    </p>`;
const newEarningsBlock = `<div className="flex flex-col gap-2">
                                       <p className="font-black text-emerald-600 dark:text-emerald-500 font-serif text-xl leading-none tracking-tighter tabular-nums drop-shadow-sm">
                                         +{formatCurrency(ref.earningsGenerated)}
                                       </p>
                                       <span className="w-fit px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 shadow-sm">
                                         Settled Daily
                                       </span>
                                    </div>`;
content = content.replace(oldEarningsBlock, newEarningsBlock);

// Replace Active Yielding block
const oldYieldingBlock = `<div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-emerald-500/5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Yielding
                                      </div>`;
const newYieldingBlock = `<div className="inline-flex flex-col items-end gap-2">
                                         <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-emerald-500/5">
                                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Yielding
                                         </div>
                                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                           Generating <span className="text-emerald-600 dark:text-emerald-500">+{formatCurrency(dailyGeneration)}</span> / day
                                         </p>
                                      </div>`;
content = content.replace(oldYieldingBlock, newYieldingBlock);

// Replace the closing map parenthesis. Note we must be careful to only replace the one for referralList in the desktop table.
// The string '                           ))' appears at line 690.
content = content.replace(
    '                              </tr>\r\n                            ))\r\n                         )}',
    '                              </tr>\r\n                            )})\r\n                         )}'
);

content = content.replace(
    '                              </tr>\n                            ))\n                         )}',
    '                              </tr>\n                            )})\n                         )}'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Desktop replacements successful");
