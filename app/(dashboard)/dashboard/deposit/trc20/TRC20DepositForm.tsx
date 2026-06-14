"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deposit } from "@/lib/actions"
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline"

export default function TRC20DepositForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [txHash, setTxHash] = useState("")
  const [amount, setAmount] = useState("")
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // The platform's TRC20 USDT receiving address
  const DEPOSIT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    const parsedAmount = parseFloat(amount)
    if (!txHash.trim()) {
      setStatus({ type: "error", text: "Please enter your TRC20 transaction hash." })
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus({ type: "error", text: "Please enter a valid deposit amount." })
      return
    }
    if (txHash.trim().length < 10) {
      setStatus({ type: "error", text: "Transaction hash appears too short. Please double-check." })
      return
    }

    startTransition(async () => {
      try {
        const res = await deposit(parsedAmount, "CRYPTO", {
          network: "TRC20",
          txHash: txHash.trim(),
        }) as any

        if (res?.success) {
          setStatus({
            type: "success",
            text: res.message || "Deposit submitted! It is pending admin review.",
          })
          setTxHash("")
          setAmount("")
          // Navigate back to wallet after a short delay
          setTimeout(() => router.push("/dashboard/wallet"), 2500)
        } else {
          setStatus({
            type: "error",
            text: res?.message || res?.error || "Submission failed. Please try again.",
          })
        }
      } catch (err: any) {
        setStatus({ type: "error", text: err.message || "A network error occurred." })
      }
    })
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-10 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">TRC20 Deposit</h1>
          <p className="text-sm text-muted-foreground">Send USDT via the TRON network and submit your transaction details</p>
        </div>

        {/* Deposit Address Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform USDT Address (TRC20)</p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">USDT · TRON</span>
          </div>
          <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-3">
            <code className="flex-1 text-sm font-mono text-foreground break-all leading-relaxed select-all">
              {DEPOSIT_ADDRESS}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              title="Copy address"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border hover:border-emerald-500 hover:bg-emerald-500/5 transition-all"
            >
              {copied
                ? <CheckIcon className="w-4 h-4 text-emerald-500" />
                : <ClipboardDocumentIcon className="w-4 h-4 text-muted-foreground" />
              }
            </button>
          </div>
          <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
            <span className="mt-0.5">⚠️</span>
            <p>Send only <strong>USDT</strong> on the <strong>TRON (TRC20)</strong> network. Sending other assets may result in permanent loss.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <p className="text-sm font-bold text-foreground">After sending, fill in your transaction details:</p>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label htmlFor="trc20-txhash" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Transaction Hash (TXID)
            </label>
            <input
              id="trc20-txhash"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="e.g. 7a3f8c2d1b..."
              spellCheck={false}
              autoComplete="off"
              disabled={isPending}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-muted/30 focus:bg-card focus:border-emerald-500 outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground/40 transition-all disabled:opacity-50"
            />
            <p className="text-[11px] text-muted-foreground px-1">
              Find this in your wallet's transaction history after sending.
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="trc20-amount" className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Amount Sent (USDT)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm select-none">$</span>
              <input
                id="trc20-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isPending}
                className="w-full pl-8 pr-16 py-3.5 rounded-xl border-2 border-border bg-muted/30 focus:bg-card focus:border-emerald-500 outline-none font-bold text-xl text-foreground placeholder:text-muted-foreground/30 transition-all disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">USDT</span>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
              status.type === "success"
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400"
            }`}>
              {status.type === "success"
                ? <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                : <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              }
              <span>{status.text}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !txHash.trim() || !amount}
            id="trc20-deposit-submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-muted disabled:text-muted-foreground text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Deposit"
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Your deposit will be reviewed and credited after admin verification.
          </p>
        </form>

        {/* Back link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/dashboard/wallet")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            ← Back to Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
