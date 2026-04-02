"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"
import { approveMerchantTransaction, rejectMerchantTransaction } from "@/app/actions/admin/merchant"
import { 
  CheckIcon, 
  XMarkIcon, 
  PhotoIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import toast, { Toaster } from "react-hot-toast"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800",
  APPROVED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-800",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-800",
}

export function MerchantDepositsClient({ transactions }: { transactions: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL')
  const [search, setSearch] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filtered = transactions.filter(tx => {
    if (filter !== 'ALL' && tx.status !== filter) return false
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (tx.user?.name || '').toLowerCase().includes(q) || (tx.user?.email || '').toLowerCase().includes(q) || tx.id.toLowerCase().includes(q)
    }
    return true
  })

  const pendingCount = transactions.filter(tx => tx.status === 'PENDING').length

  const handleApprove = (id: string) => {
    if (!confirm("Approve this transaction? This will credit the user's balance.")) return
    setProcessingId(id)
    startTransition(async () => {
      const res = await approveMerchantTransaction(id)
      if (res.success) { toast.success("Transaction approved!"); router.refresh() }
      else toast.error(res.error || "Failed to approve")
      setProcessingId(null)
    })
  }

  const handleReject = (id: string) => {
    if (!confirm("Reject this transaction?")) return
    setProcessingId(id)
    startTransition(async () => {
      const res = await rejectMerchantTransaction(id)
      if (res.success) { toast.success("Transaction rejected"); router.refresh() }
      else toast.error(res.error || "Failed to reject")
      setProcessingId(null)
    })
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Merchant Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review deposits and withdrawals from local payment methods.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-card border border-border rounded-xl px-3 py-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground shrink-0"/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or ID..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"/>
        </div>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                filter === s ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {s.toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border">
          {(['ALL', 'DEPOSIT', 'WITHDRAWAL'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                typeFilter === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <FunnelIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3"/>
          <p className="text-foreground font-bold">No transactions found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(tx => {
            const isDeposit = tx.type === 'DEPOSIT'
            const isPendingTx = tx.status === 'PENDING'
            const isProcessing = processingId === tx.id

            return (
              <div key={tx.id} className={cn(
                "bg-card border rounded-2xl overflow-hidden transition-all",
                isPendingTx ? "border-amber-200 dark:border-amber-800/50 shadow-sm" : "border-border"
              )}>
                {/* Top accent bar for pending */}
                {isPendingTx && <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"/>}

                <div className="p-4 sm:p-5">
                  {/* Row 1: User + Amount + Status */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isDeposit ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      )}>
                        {isDeposit ? <ArrowDownTrayIcon className="w-5 h-5"/> : <ArrowUpTrayIcon className="w-5 h-5"/>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm truncate">{tx.user?.name || "Unknown User"}</div>
                        <div className="text-xs text-muted-foreground truncate">{tx.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={cn("text-lg font-bold", isDeposit ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400")}>
                          {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                        {tx.convertedAmount && (
                          <div className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
                            {tx.convertedAmount.toLocaleString()} {tx.currency}
                          </div>
                        )}
                      </div>
                      <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border", STATUS_STYLES[tx.status] || STATUS_STYLES.PENDING)}>
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Type</div>
                      <div className="text-sm font-bold text-foreground">{tx.type}</div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Country</div>
                      <div className="text-sm font-bold text-foreground">{tx.countryCode}</div>
                    </div>
                    {tx.exchangeRate && (
                      <div className="bg-muted/30 rounded-xl p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Rate</div>
                        <div className="text-sm font-bold text-foreground">1 USD = {tx.exchangeRate} {tx.currency}</div>
                      </div>
                    )}
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Date</div>
                      <div className="text-sm font-bold text-foreground" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-muted-foreground" suppressHydrationWarning>{new Date(tx.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  {/* Row 3: Withdrawal account details */}
                  {tx.type === 'WITHDRAWAL' && tx.accountNumber && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl p-3 mb-4">
                      <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Withdrawal Account</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-foreground"><span className="text-muted-foreground">Name:</span> <strong>{tx.accountName}</strong></span>
                        <span className="text-foreground"><span className="text-muted-foreground">Number:</span> <strong className="font-mono">{tx.accountNumber}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Row 4: Screenshot + Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {tx.screenshot ? (
                        <button onClick={() => setPreviewImage(tx.screenshot)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-xs font-bold border border-blue-100 dark:border-blue-800/30">
                          <EyeIcon className="w-4 h-4"/> View Payment Proof
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No screenshot uploaded</span>
                      )}
                    </div>

                    {isPendingTx && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(tx.id)} disabled={isProcessing}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm min-w-[100px]">
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                          ) : (
                            <><CheckIcon className="w-4 h-4"/> Approve</>
                          )}
                        </button>
                        <button onClick={() => handleReject(tx.id)} disabled={isProcessing}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-red-200 dark:border-red-800/30 min-w-[100px]">
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"/>
                          ) : (
                            <><XMarkIcon className="w-4 h-4"/> Reject</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <h3 className="text-sm font-bold text-foreground">Payment Proof Screenshot</h3>
              <button onClick={() => setPreviewImage(null)} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <XMarkIcon className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-60px)] flex items-center justify-center bg-muted/20">
              <img src={previewImage} alt="Payment proof" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}