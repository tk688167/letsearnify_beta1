export const dynamic = "force-dynamic";

import { getWithdrawalRequests } from "@/app/actions/admin/withdrawal";
import { getUsersWithActiveCooldown } from "@/app/actions/admin/timer";
import WithdrawalTabs from "./withdrawal-tabs";
import {
  BanknotesIcon,
  InboxStackIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "Withdraw Requests | Admin Portal",
};

export default async function WithdrawalPage() {
  const [requestsData, cooldownUsersData] = await Promise.all([
    getWithdrawalRequests(),
    getUsersWithActiveCooldown(),
  ]);

  const requests = requestsData || [];
  const cooldownUsers = cooldownUsersData || [];

  const pendingRequests = requests.filter(
    (r: any) => r.status?.toUpperCase() === "PENDING",
  );

  const totalPending = pendingRequests.reduce(
    (acc: number, r: any) => acc + (Number(r.amount) || 0),
    0,
  );
  // Calculate total pending in PKR
  const totalPendingPKR = pendingRequests.reduce(
    (acc: number, r: any) => acc + (Number(r.convertedAmount) || 0),
    0,
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto min-h-screen text-slate-700 dark:text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-slate-800/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">
            Withdraw Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Audit pending transfers, override smart cooldown gates, and stream
            payouts.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#0E172B]/80 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-slate-800/40 shadow-sm flex items-center justify-between group hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-300">
          <div className="space-y-1.5">
            <div className="text-[10px] text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Pending Queue
            </div>
            <div className="text-2xl text-gray-900 dark:text-white tracking-tight">
              {pendingRequests.length}{" "}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                tasks
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <InboxStackIcon className="w-6 h-6 md:w-7 md:h-7" />
          </div>
        </div>
      <div className="bg-white dark:bg-[#0E172B]/80 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-slate-800/40 shadow-sm hover:shadow-md transition-all duration-300 group">
  <div className="flex items-start justify-between gap-4">
    
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        Volume Pending
      </p>

      <div className="space-y-2">
        {/* USD */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white break-all">
            {totalPending.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            USD
          </span>
        </div>

        {/* PKR */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 break-all">
            {totalPendingPKR.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            PKR
          </span>
        </div>
      </div>
    </div>

    <div className="shrink-0 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
      <BanknotesIcon className="w-6 h-6 md:w-7 md:h-7" />
    </div>
  </div>
</div>
        <div className="bg-white dark:bg-[#0E172B]/80 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-slate-800/40 shadow-sm flex items-center justify-between group sm:col-span-2 lg:col-span-1 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-300">
          <div className="space-y-1.5">
            <div className="text-[10px] text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Throttled Wallets
            </div>
            <div className="text-2xl  text-amber-600 dark:text-orange-400 tracking-tight">
              {cooldownUsers.length}{" "}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                users
              </span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-orange-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <ClockIcon className="w-6 h-6 md:w-7 md:h-7" />
          </div>
        </div>
      </div>

      {/* 🎚️ WRAPPER WITH INTERACTIVE TABS */}
      <WithdrawalTabs requests={requests} cooldownUsers={cooldownUsers} />
    </div>
  );
}
