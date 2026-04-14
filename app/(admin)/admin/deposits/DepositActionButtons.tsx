"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { approveDeposit, rejectDeposit } from "@/app/actions/admin/deposits"

type Props = {
  transactionId: string
  compact?: boolean
}

export default function DepositActionButtons({ transactionId, compact = false }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [processingAction, setProcessingAction] = useState<"APPROVE" | "REJECT" | null>(null)

  const handleAction = (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !window.confirm("Reject this deposit request?")) {
      return
    }

    setProcessingAction(action)

    startTransition(async () => {
      try {
        const result =
          action === "APPROVE"
            ? await approveDeposit(transactionId)
            : await rejectDeposit(transactionId, "Admin Rejected")

        if (result?.success) {
          router.refresh()
          return
        }

        window.alert(result?.error || "Failed to process the deposit request.")
      } catch (error) {
        console.error("Deposit action failed:", error)
        window.alert("Failed to process the deposit request.")
      } finally {
        setProcessingAction(null)
      }
    })
  }

  const disabled = isPending || processingAction !== null

  if (compact) {
    return (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleAction("APPROVE")}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
        >
          {processingAction === "APPROVE" ? <ClockIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
          {processingAction === "APPROVE" ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={() => handleAction("REJECT")}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-gray-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-bold transition disabled:opacity-60"
        >
          {processingAction === "REJECT" ? <ClockIcon className="w-4 h-4 animate-spin" /> : <XCircleIcon className="w-4 h-4" />}
          {processingAction === "REJECT" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={disabled}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60"
      >
        {processingAction === "APPROVE" ? <ClockIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
        {processingAction === "APPROVE" ? "Approving..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("REJECT")}
        disabled={disabled}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-gray-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-xs font-bold transition disabled:opacity-60"
      >
        {processingAction === "REJECT" ? <ClockIcon className="w-4 h-4 animate-spin" /> : <XCircleIcon className="w-4 h-4" />}
        {processingAction === "REJECT" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  )
}
