"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { generateImpersonationToken } from "@/app/actions/admin/impersonate"
import { processManualDeposit } from "@/app/actions/admin/manual-deposit"
import {
  PencilSquareIcon, XMarkIcon, UserGroupIcon, TrashIcon, EyeIcon,
  ArrowPathIcon, ShieldCheckIcon, BanknotesIcon, StarIcon,
  CheckCircleIcon, ExclamationTriangleIcon, LockClosedIcon, LockOpenIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline"

type UserActionsProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    balance: number
    arnBalance?: number
    lockedArnBalance?: number
    activeMembers?: number
    tier?: string
    totalDeposit?: number
    isActiveMember: boolean
  }
  onUpdated?: (updatedUser: any) => void
}

const TIERS = ["NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "EMERALD"]
const ARN_PER_USD = 10

export default function UserActions({ user, onUpdated }: UserActionsProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDropdownOpen])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggleLockLoading, setToggleLockLoading] = useState(false)
  const [impersonateLoading, setImpersonateLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [form, setForm] = useState({
    name: user.name || "",
    balance: user.balance.toFixed(2),
    arnBalance: String(user.arnBalance ?? 0),
    arnUsd: String(((user.arnBalance ?? 0) / ARN_PER_USD).toFixed(2)),
    activeMembers: String(user.activeMembers ?? 0),
    tier: user.tier || "NEWBIE",
  })

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  const handleArnChange = (val: string) => {
    const arn = parseFloat(val) || 0
    setForm(f => ({ ...f, arnBalance: val, arnUsd: (arn / ARN_PER_USD).toFixed(2) }))
  }

  const handleArnUsdChange = (val: string) => {
    const usd = parseFloat(val) || 0
    setForm(f => ({ ...f, arnUsd: val, arnBalance: String((usd * ARN_PER_USD).toFixed(2)) }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          balance: parseFloat(form.balance),
          arnBalance: parseFloat(form.arnBalance),
          activeMembers: parseInt(form.activeMembers),
          tier: form.tier,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      showToast("success", "User updated successfully!")
      setIsEditOpen(false)
      onUpdated?.(data.user)
      router.refresh()
    } catch (err: any) {
      showToast("error", err.message || "Update failed")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete")
      showToast("success", "User deleted.")
      setIsDeleteOpen(false)
      router.refresh()
    } catch (err: any) {
      showToast("error", err.message || "Delete failed")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleLock = async () => {
    setToggleLockLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActiveMember: !user.isActiveMember }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to toggle status")
      showToast("success", `User account ${!user.isActiveMember ? 'unlocked' : 'locked'} successfully!`)
      onUpdated?.({ ...user, ...data.user })
      router.refresh()
    } catch (err: any) {
      showToast("error", err.message || "Toggle failed")
    } finally {
      setToggleLockLoading(false)
    }
  }

  const handleImpersonate = async () => {
    if (!confirm(`Log in as ${user.name || user.email}? You will be signed out of this admin session.`)) return
    setImpersonateLoading(true)
    try {
      const res = await generateImpersonationToken(user.id)
      if (!res.success || !res.token) throw new Error(res.error || "Failed to generate token")
      await signIn("impersonation", { token: res.token, callbackUrl: "/dashboard", redirect: true })
    } catch (err: any) {
      showToast("error", err.message || "Impersonation failed")
      setImpersonateLoading(false)
    }
  }

  // Shared input style
  const inputCls = "w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/30 outline-none font-medium text-gray-900 dark:text-white text-xs transition-all"
  const labelCls = "block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1"

  return (
    <>
      {/* Dropdown Action Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          Actions
          <svg className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 text-left">
            {user.role === "ADMIN" && (
              <button
                onClick={() => { setIsDropdownOpen(false); handleImpersonate(); }}
                disabled={impersonateLoading}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
              >
                <EyeIcon className={`w-4 h-4 ${impersonateLoading ? "animate-pulse" : ""}`} />
                Log in as Admin
              </button>
            )}
            <Link
              href={`/admin/users/${user.id}/info`}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <InformationCircleIcon className="w-4 h-4" />
              Info
            </Link>
            <Link
              href={`/admin/users/${user.id}/tree`}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2"
            >
              <UserGroupIcon className="w-4 h-4" />
              Refer Tree
            </Link>
            <button
              onClick={() => { setIsDropdownOpen(false); handleToggleLock(); }}
              disabled={toggleLockLoading}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2 ${
                user.isActiveMember 
                  ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20" 
                  : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              }`}
            >
              {toggleLockLoading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : user.isActiveMember ? (
                <LockClosedIcon className="w-4 h-4" />
              ) : (
                <LockOpenIcon className="w-4 h-4" />
              )}
              {user.isActiveMember ? "Lock Account" : "Unlock Account"}
            </button>
            <button
              onClick={() => { setIsDropdownOpen(false); setIsEditOpen(true); }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit User
            </button>
            
            <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 font-mono mx-2"></div>

            <button
              onClick={() => { setIsDropdownOpen(false); setIsDeleteOpen(true); }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete User
            </button>
          </div>
        )}
      </div>

      {/* Portaled Modals & Toast */}
      {mounted && createPortal(
        <>
          {/* Toast */}
          {toast && (
            <div className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold ${
              toast.type === "success" ? "bg-emerald-600 border-emerald-500 text-white" : "bg-red-600 border-red-500 text-white"
            }`}>
              {toast.type === "success" ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />}
              {toast.text}
            </div>
          )}

          {/* ── EDIT MODAL ─────────────────────────────── */}
          {isEditOpen && (
            <div
              className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsEditOpen(false)}
            >
              <form
                onSubmit={handleUpdate}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
              >
                {/* ── Header ── */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Edit User</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 truncate max-w-[240px]">{user.email}</p>
                  </div>
                  <button type="button" onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* ── Body ── */}
                <div className="p-4 space-y-3">

                  {/* Row 1: Name (wide) + Tier */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className={labelCls}>Full Name</label>
                      <input type="text" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className={inputCls} placeholder="User's name" />
                    </div>
                    <div>
                      <label className={labelCls}>Tier</label>
                      <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} className={inputCls}>
                        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Role (read-only) + Active Members */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Role</label>
                      <div className={`${inputCls} flex items-center gap-1.5 bg-gray-100/60 dark:bg-slate-800/60`}>
                        {user.role === "ADMIN" && <ShieldCheckIcon className="w-3 h-3 text-purple-500 shrink-0" />}
                        {user.role}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Active Members</label>
                      <input type="number" min="0" step="1" value={form.activeMembers}
                        onChange={e => setForm(f => ({ ...f, activeMembers: e.target.value }))}
                        className={inputCls} placeholder="0" />
                    </div>
                  </div>

                  {/* Divider with label */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                      <BanknotesIcon className="w-2.5 h-2.5" /> Financial Controls
                    </span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
                  </div>

                  {/* Row 3: USD Balance */}
                  <div>
                    <label className={labelCls}>USD Wallet Balance</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                      <input type="number" step="0.01" min="0" value={form.balance}
                        onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                        className={`${inputCls} pl-6`} placeholder="0.00" />
                    </div>
                  </div>

                  {/* Row 4: ARN tokens ↔ USD (side by side, amber box) */}
                  <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10 p-2.5">
                    <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
                      <StarIcon className="w-3 h-3" /> ARN Tokens — 10 ARN = $1 · live sync
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>ARN Amount</label>
                        <div className="relative">
                          <input type="number" min="0" step="0.01" value={form.arnBalance}
                            onChange={e => handleArnChange(e.target.value)}
                            className="w-full pl-2.5 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 rounded-lg focus:ring-2 focus:ring-amber-400/30 outline-none font-mono font-bold text-gray-900 dark:text-white text-xs"
                            placeholder="0.00" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-extrabold text-amber-500">ARN</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>USD Value</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                          <input type="number" min="0" step="0.01" value={form.arnUsd}
                            onChange={e => handleArnUsdChange(e.target.value)}
                            className="w-full pl-5 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 rounded-lg focus:ring-2 focus:ring-amber-400/30 outline-none font-mono font-bold text-gray-900 dark:text-white text-xs"
                            placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact preview strip */}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                    {[
                      { k: "Name", v: form.name || "—" },
                      { k: "Tier", v: form.tier },
                      { k: "USD", v: `$${parseFloat(form.balance || "0").toFixed(2)}` },
                      { k: "ARN", v: `${parseFloat(form.arnBalance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${user.lockedArnBalance ? ` (+${user.lockedArnBalance}L)` : ''}` },
                      { k: "Members", v: form.activeMembers },
                    ].map(r => (
                      <span key={r.k} className="text-[10px] text-gray-400 dark:text-gray-500">
                        {r.k}: <span className="font-bold text-gray-700 dark:text-gray-200 font-mono">{r.v}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60">
                  <button type="button" onClick={() => setIsEditOpen(false)}
                    className="flex-1 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={editLoading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5">
                    {editLoading ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── DELETE MODAL ─────────────────────────────── */}
          {isDeleteOpen && (
            <div
              className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsDeleteOpen(false)}
            >
              <div
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-5 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Delete User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Are you sure you want to permanently delete <strong>{user.name || user.email}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setIsDeleteOpen(false)}
                      className="flex-1 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs">
                      Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleteLoading}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5">
                      {deleteLoading ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  )
}
