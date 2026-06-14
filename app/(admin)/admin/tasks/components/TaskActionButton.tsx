'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { approveTaskCompletion, rejectTaskCompletion } from "@/app/actions/admin/task-approvals"

type Props = {
  taskId: string
  compact?: boolean
  onSuccess?: () => void
}

export default function TaskActionButton({ taskId, compact = false, onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [localAction, setLocalAction] = useState<"APPROVE" | "REJECT" | null>(null)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  const handleApprove = () => {
    setLocalAction("APPROVE")
    onSuccess?.()
    startTransition(async () => {
      try {
        const result = await approveTaskCompletion(taskId)
        if (result?.success) { router.refresh(); return }
        setLocalAction(null)
      } catch {
        setLocalAction(null)
      }
    })
  }

  const handleRejectConfirm = () => {
    setShowRejectConfirm(false)
    setLocalAction("REJECT")
    onSuccess?.()
    startTransition(async () => {
      try {
        const result = await rejectTaskCompletion(taskId, "Admin Rejected")
        if (result?.success) { router.refresh(); return }
        setLocalAction(null)
      } catch {
        setLocalAction(null)
      }
    })
  }

  // Loading states
  if (localAction === "APPROVE") {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-semibold ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}>
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
        Approving…
      </div>
    )
  }

  if (localAction === "REJECT") {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl font-semibold ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}>
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
        Rejecting…
      </div>
    )
  }

  // Inline reject confirmation — no window.confirm()
  if (showRejectConfirm) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-gray-500 dark:text-slate-400 font-medium ${compact ? "text-[11px]" : "text-xs"}`}>
          Reject?
        </span>
        <button
          onClick={handleRejectConfirm}
          disabled={isPending}
          className={`bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}
        >
          Yes, reject
        </button>
        <button
          onClick={() => setShowRejectConfirm(false)}
          disabled={isPending}
          className={`border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl font-bold shadow-sm shadow-green-500/20 transition-all disabled:opacity-50 ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"}`}
      >
        <CheckCircleIcon className="w-3.5 h-3.5" />
        {!compact && "Approve"}
      </button>
      <button
        onClick={() => setShowRejectConfirm(true)}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 rounded-xl font-semibold transition-all disabled:opacity-50 ${compact ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"}`}
      >
        <XCircleIcon className="w-3.5 h-3.5" />
        {!compact && "Reject"}
      </button>
    </div>
  )
}
