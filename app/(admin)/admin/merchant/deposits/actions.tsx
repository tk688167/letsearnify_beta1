"use client"

import { approveMerchantTransaction, rejectMerchantTransaction } from "@/app/actions/admin/merchant"
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function TransactionActions({ id, status }: { id: string, status: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    if (status !== 'PENDING') return null

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to approve this transaction?")) return
        startTransition(async () => {
            await approveMerchantTransaction(id)
            router.refresh()
        })
    }

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this transaction?")) return
        startTransition(async () => {
            await rejectMerchantTransaction(id)
            router.refresh()
        })
    }

    return (
        <div className="flex items-center gap-2">
            <button 
                onClick={handleApprove} 
                disabled={isPending}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
                title="Approve"
            >
                <CheckIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={handleReject} 
                disabled={isPending}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                title="Reject"
            >
                <XMarkIcon className="w-5 h-5"/>
            </button>
        </div>
    )
}
