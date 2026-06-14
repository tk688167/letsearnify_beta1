"use client";

import { useState } from "react";
import WithdrawalTable from "./withdrawal-table";
import CooldownManager from "./cooldown-manager";
import { InboxStackIcon, ClockIcon } from "@heroicons/react/24/outline";

type TabsType = "requests" | "cooldowns";

interface WithdrawalTabsProps {
  requests: any[];
  cooldownUsers: any[];
}

export default function WithdrawalTabs({ requests, cooldownUsers }: WithdrawalTabsProps) {
  const [activeTab, setActiveTab] = useState<TabsType>("requests");

  const tabIcons = {
    requests: <InboxStackIcon className="w-3.5 h-3.5" />,
    cooldowns: <ClockIcon className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6">
      {/* TABS CONTROLLER */}
      <div className="grid grid-cols-2 sm:flex gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl w-full sm:w-fit border border-gray-200 dark:border-slate-800/60 shadow-sm">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all duration-200 w-full sm:w-auto ${
            activeTab === "requests"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
              activeTab === "requests" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-800"
            }`}
          >
            {tabIcons.requests}
          </span>
          <span className="truncate">Withdrawal Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cooldowns")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all duration-200 w-full sm:w-auto ${
            activeTab === "cooldowns"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
              activeTab === "cooldowns" ? "bg-white/20" : "bg-gray-100 dark:bg-slate-800"
            }`}
          >
            {tabIcons.cooldowns}
          </span>
          <span className="truncate">Active Cooldowns ({cooldownUsers.length})</span>
        </button>
      </div>

      {/* DYNAMIC CONTENT PANEL */}
      <div className="transition-all duration-300">
        {activeTab === "requests" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <WithdrawalTable requests={requests} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {cooldownUsers.length > 0 ? (
              <CooldownManager users={cooldownUsers} />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl p-12 text-center">
                <ClockIcon className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">No Active Cooldowns</h3>
                <p className="text-xs text-gray-400 mt-1">There are currently no users throttled under system gates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}