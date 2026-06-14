"use client"

import { useState } from "react"
import { UserGroupIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

type ReferralNode = {
  id: string
  name: string | null
  email: string | null
  tier: string
  arnBalance: number
  createdAt: Date
  level: number
}

type AdminTreeClientProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    referralCode: string | null
    referrerName?: string | null
    referrerCode?: string | null
  }
  stats: {
    teamSize: number
    totalEarnings: number
    todayEarnings: number
  }
  referralTree: ReferralNode[]
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  2: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  3: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300",
}

export default function AdminTreeClient({ user, stats, referralTree }: AdminTreeClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | 1 | 2 | 3>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTree = referralTree
    .filter((n) => activeTab === "ALL" || n.level === activeTab)
    .filter(
      (n) =>
        !searchTerm ||
        n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const countFor = (level: 1 | 2 | 3) =>
    referralTree.filter((n) => n.level === level).length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 mix-blend-multiply rounded-full blur-3xl -z-0 transform translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-start gap-4 sm:gap-6 relative z-10 w-full md:w-auto">
          <Link
            href="/admin/users"
            className="p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-2xl transition-colors shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
          </Link>

          <div className="flex flex-col gap-1 w-full overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold rounded text-[10px] uppercase tracking-widest">
                Admin · Referral Tree
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate mt-1">
              {user.name || "Unnamed User"}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 shrink-0 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Team Size</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.teamSize}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Earned</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ${stats.totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ── REFERRER SOURCE ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Referred By (Upstream Source)
          </h2>
          {user.referrerName ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                {user.referrerName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{user.referrerName}</p>
                <p className="text-xs font-mono text-indigo-500 dark:text-indigo-400">
                  Code: {user.referrerCode}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-base font-bold text-gray-400 italic">
              Direct Signup — No Referrer
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
          Ref Code: <span className="ml-1.5 font-mono">{user.referralCode || "NONE"}</span>
        </div>
      </div>

      {/* ── DOWNSTREAM TREE ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Downstream Referrals</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {stats.teamSize} total · L1: {countFor(1)} · L2: {countFor(2)} · L3: {countFor(3)}
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
          />
        </div>

        {/* Level Tabs */}
        <div className="flex w-full overflow-x-auto border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/10">
          {(["ALL", 1, 2, 3] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                activeTab === level
                  ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {level === "ALL"
                ? `All Levels (${stats.teamSize})`
                : `Level ${level} (${countFor(level)})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  Level
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredTree.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm font-medium text-gray-400 dark:text-gray-500"
                  >
                    {searchTerm
                      ? `No referrals match "${searchTerm}"`
                      : `No referrals at ${activeTab === "ALL" ? "any level" : `Level ${activeTab}`}`}
                  </td>
                </tr>
              ) : (
                filteredTree.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                          LEVEL_COLORS[n.level] ?? LEVEL_COLORS[1]
                        }`}
                      >
                        L{n.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {n.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {n.email || "No email"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded uppercase tracking-wider">
                        {n.tier || "NEWBIE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
