"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminUserInfoPage;
var auth_1 = require("@/auth");
var navigation_1 = require("next/navigation");
var prisma_1 = require("@/lib/prisma");
var link_1 = require("next/link");
var outline_1 = require("@heroicons/react/24/outline");
var date_fns_1 = require("date-fns");
function AdminUserInfoPage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var session, id, user, _c, totalWithdrawalsAgg, referralCount, marketplaceGigs, totalWithdrawn, activeMudarabahInvestments, totalMudarabahActive;
        var _d;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, auth_1.auth)()];
                case 1:
                    session = _e.sent();
                    if (!((_d = session === null || session === void 0 ? void 0 : session.user) === null || _d === void 0 ? void 0 : _d.email) || session.user.role !== "ADMIN")
                        (0, navigation_1.redirect)("/dashboard");
                    return [4 /*yield*/, params
                        // 1. Fetch Primary User Data
                    ];
                case 2:
                    id = (_e.sent()).id;
                    return [4 /*yield*/, prisma_1.default.user.findUnique({
                            where: { id: id },
                            include: {
                                investments: true, // legacy tracking
                                mudarabahInvestments: { include: { pool: true } }
                            }
                        })];
                case 3:
                    user = _e.sent();
                    if (!user) {
                        return [2 /*return*/, (<div className="p-8 text-center bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Not Found</h2>
         <link_1.default href="/admin/users" className="text-blue-500 hover:underline mt-4 inline-block">Return to Management</link_1.default>
      </div>)];
                    }
                    return [4 /*yield*/, Promise.all([
                            prisma_1.default.transaction.aggregate({
                                where: { userId: id, type: "WITHDRAWAL", status: "COMPLETED" },
                                _sum: { amount: true }
                            }),
                            prisma_1.default.user.count({
                                where: { referredByCode: user.referralCode }
                            }),
                            prisma_1.default.gig.count({
                                where: { sellerId: id }
                            })
                        ])];
                case 4:
                    _c = _e.sent(), totalWithdrawalsAgg = _c[0], referralCount = _c[1], marketplaceGigs = _c[2];
                    totalWithdrawn = totalWithdrawalsAgg._sum.amount || 0;
                    activeMudarabahInvestments = user.mudarabahInvestments.filter(function (inv) { return inv.status === "ACTIVE"; });
                    totalMudarabahActive = activeMudarabahInvestments.reduce(function (sum, inv) { return sum + inv.amount; }, 0);
                    return [2 /*return*/, (<div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <link_1.default href="/admin/users" className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-colors">
            <outline_1.ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
          </link_1.default>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {user.name || "Unnamed User"}
              {user.isActiveMember && <outline_1.CheckBadgeIcon className="w-6 h-6 text-green-500" title="Active Member"/>}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono mt-0.5">{user.email || "No Email"} • Joined {(0, date_fns_1.format)(user.createdAt, 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-1">
           <div className={"px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ".concat(user.isActiveMember
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50")}>
             Status: {user.isActiveMember ? 'Active & Unlocked' : 'Locked'}
           </div>
           <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wide">
             Tier: <span className="text-blue-600 dark:text-blue-400">{user.tier}</span>
           </div>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Wallet Balance */}
         <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <outline_1.WalletIcon className="w-24 h-24 text-blue-600"/>
           </div>
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
               <outline_1.WalletIcon className="w-6 h-6"/>
             </div>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Withdrawable USD</p>
           </div>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white relative z-10 font-mono">
             ${user.balance.toFixed(2)}
           </h3>
         </div>

         {/* ARN Tokens */}
         <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <outline_1.BanknotesIcon className="w-24 h-24 text-purple-600"/>
           </div>
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
               <outline_1.BanknotesIcon className="w-6 h-6"/>
             </div>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total ARN Tokens</p>
           </div>
           <div className="relative z-10">
             <h3 className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none">
               {user.arnBalance.toLocaleString()}
             </h3>
             {user.lockedArnBalance > 0 && (<p className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-1">
                 + {user.lockedArnBalance.toLocaleString()} Locked Bonus
               </p>)}
           </div>
         </div>

         {/* Total Deposited */}
         <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <outline_1.ArchiveBoxIcon className="w-24 h-24 text-emerald-600"/>
           </div>
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
               <outline_1.ArchiveBoxIcon className="w-6 h-6"/>
             </div>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lifetime Deposits</p>
           </div>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white relative z-10 font-mono">
             ${(user.totalDeposit || 0).toFixed(2)}
           </h3>
         </div>

         {/* Total Withdrawn */}
         <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <outline_1.BanknotesIcon className="w-24 h-24 text-red-600"/>
           </div>
           <div className="flex items-center gap-3 mb-3 relative z-10">
             <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400">
               <outline_1.BanknotesIcon className="w-6 h-6"/>
             </div>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lifetime Withdrawn</p>
           </div>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white relative z-10 font-mono">
             ${totalWithdrawn.toFixed(2)}
           </h3>
         </div>
      </div>

      {/* DETAILED ECOSYSTEM ACTIVITY */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white pt-4 px-2">Ecosystem Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Referrals Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <outline_1.UserGroupIcon className="w-8 h-8"/>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Partner Program</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-4">Total individuals who joined using this user's referral code.</p>
            
            <div className="w-full grid grid-cols-2 gap-2 mt-auto">
               <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Invited</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white font-mono">{referralCount}</p>
               </div>
               <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Team</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{user.activeMembers}</p>
               </div>
            </div>
        </div>

        {/* Mudarabah Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <outline_1.BanknotesIcon className="w-8 h-8"/>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Mudarabah Pools</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-4">Investment activity across structured halaal profit pools.</p>
            
            <div className="w-full grid grid-cols-2 gap-2 mt-auto">
               <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Inv.</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white font-mono">${totalMudarabahActive.toFixed(2)}</p>
               </div>
               <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pools</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{activeMudarabahInvestments.length}</p>
               </div>
            </div>
        </div>

        {/* Marketplace Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <outline_1.ShoppingBagIcon className="w-8 h-8"/>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Freelance Marketplace</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-4">Status of seller profiles and service gigs offered on platform.</p>
            
            <div className="w-full mt-auto bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700 text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Marketplace Profile</p>
               {marketplaceGigs > 0 ? (<p className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">Verified Seller ({marketplaceGigs} Gigs)</p>) : (<p className="text-sm font-bold text-gray-500 dark:text-gray-400">Not Setup</p>)}
            </div>
        </div>

      </div>
    </div>)];
            }
        });
    });
}
