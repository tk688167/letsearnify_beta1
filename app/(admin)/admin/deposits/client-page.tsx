"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rejectMerchantTransaction, approveMerchantTransaction } from "@/app/actions/admin/merchant"; // ✅ fixed import
import { approveDeposit, rejectDeposit } from "@/app/actions/admin/deposits";
import ImagePreviewToggle from "./ImagePreviewToggle";

interface Deposit {
  id: string;
  txId: string;
  userId: string;
  amount: number;
  status: string;
  type: string;
  method?: string;
  screenshotUrl?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

interface MerchantTx {
  id: string;
  userId: string;
  countryCode?: string;
  paymentMethodId?: string;
  type: string;
  amount: number;
  currency?: string;
  convertedAmount?: number;
  exchangeRate?: number;
  screenshot?: string;
  accountNumber?: string;
  accountName?: string;
  note?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  userProfileName?: string;
  user?: { name: string; email: string };
  resolvedMethodName?: string;
  isLocalMobileWallet?: boolean;
}

type TabType = "TRC20" | "Binance" | "Merchant";
type StatusFilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

interface ModalState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getMethodName(tx: MerchantTx): string | null {
  if (tx.resolvedMethodName) return tx.resolvedMethodName;
  if (tx.currency === "PKR") {
    return tx.accountNumber?.startsWith("03")
      ? "EasyPaisa/JazzCash"
      : "Local Agent";
  }
  return null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;
const TAB_ICONS: Record<TabType, string> = {
  TRC20: "T",
  Binance: "B",
  Merchant: "M",
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
function usePagination<T>(data: T[], resetDeps: unknown[]) {
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPage(1);
  }, resetDeps);
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginated = data.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  return { page, setPage, totalPages, paginated };
}

// ─── Sub‑components ───────────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#1F2C56]">
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Prev
        </button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`e-${i}`}
              className="px-2 text-gray-400 dark:text-gray-600 text-xs select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? "page" : undefined}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${page === p ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-teal-500",
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm ${colors[idx]}`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const isPending = s === "PENDING";
  const isApproved = s === "COMPLETED" || s === "APPROVED";
  const isRejected = s === "REJECTED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        isPending
          ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20"
          : isApproved
            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20"
            : isRejected
              ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20"
              : "bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-amber-500 animate-pulse" : isApproved ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-gray-500"}`}
      />
      {isApproved ? "APPROVED" : status?.toUpperCase()}
    </span>
  );
}

function Spinner({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-gray-200 dark:border-slate-800/70 overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

function ToastNotification({ toast }: { toast: ToastState }) {
  if (!toast.show) return null;
  const bgType =
    toast.type === "success"
      ? "bg-emerald-500 border-emerald-600"
      : toast.type === "error"
        ? "bg-red-500 border-red-600"
        : "bg-blue-600 border-blue-700";

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-slide-up">
      <div className={`${bgType} border text-white text-xs font-black px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 tracking-wide backdrop-blur-md`}>
        {toast.type === "success" && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === "error" && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function ConfirmationModal({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  if (!modal.show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0E172B] border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 transform scale-100 transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase">
            {modal.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {modal.message}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              modal.onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deposit Card (only deposits) ────────────────────────────────────────────
function DepositCard({
  deposit,
  isMounted,
  activeTab,
  loadingId,
  onActionRequest,
}: {
  deposit: Deposit;
  isMounted: boolean;
  activeTab: TabType;
  loadingId: string | null;
  onActionRequest: (id: string, status: "APPROVED" | "REJECTED", type: string) => void;
}) {
  const isPending = deposit.status?.toUpperCase() === "PENDING";
  const network = deposit.method || activeTab;
  const isLoading = loadingId === deposit.id;

  const borderGradient = "bg-gradient-to-r from-emerald-500/80 to-transparent";

  const isTxIdAnImage = deposit.txId?.startsWith("http://") || deposit.txId?.startsWith("https://");
  const finalScreenshotUrl = isTxIdAnImage ? deposit.txId : deposit.screenshotUrl;

  return (
    <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-gray-200 dark:border-slate-800/70 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className={`h-0.5 w-full ${borderGradient}`} />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 items-center min-w-0">
            <UserAvatar name={deposit.user?.name || "U"} />
            <div className="min-w-0">
              <h4 className="font-black text-sm truncate">
                {deposit.user?.name || "Anonymous"}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                {deposit.user?.email || "No email attached"}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
              +${Number(deposit.amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-[#0B1329] p-3 rounded-xl border border-gray-200 dark:border-slate-800/70 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Type
            </p>
            <p className="font-black uppercase text-emerald-600 dark:text-emerald-400">
              DEPOSIT
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Network
            </p>
            <p className="font-black font-mono uppercase text-gray-900 dark:text-white">
              {network}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              User ID
            </p>
            <p className="font-mono truncate text-[11px] text-gray-700 dark:text-gray-300">
              {deposit.userId || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Date / Time
            </p>
            <p className="font-mono text-gray-700 dark:text-gray-300" suppressHydrationWarning>
              {deposit.createdAt && isMounted
                ? new Date(deposit.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Account Route Box */}
        <div className="bg-gray-50 dark:bg-[#0B1329]/60 p-3 rounded-xl border border-gray-200 dark:border-[#1F2C56]/30 flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest">
                Account Route
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider">
                {network}
              </span>
            </div>
            <p className="font-mono text-gray-700 dark:text-gray-300 text-[11px] break-all max-w-[260px] sm:max-w-[400px]">
              {deposit.txId ? (
                <>
                  TxID: <span className="font-bold">{isTxIdAnImage ? "Image URL Attached" : deposit.txId}</span>
                </>
              ) : (
                <span className="italic text-gray-400 dark:text-gray-600">
                  No TXID provided
                </span>
              )}
            </p>
          </div>
          <div>
            {finalScreenshotUrl ? (
              <ImagePreviewToggle
                imageUrl={finalScreenshotUrl}
                title={`${network} Payment Proof`}
              />
            ) : (
              <span className="text-gray-400 dark:text-gray-600 italic text-[11px]">
                No screenshot uploaded
              </span>
            )}
          </div>
        </div>

        {/* Actions / Status Section */}
        {isPending ? (
          <div className="flex justify-end gap-2 pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
            <button
              onClick={() => onActionRequest(deposit.id, "REJECTED", "deposit")}
              disabled={isLoading}
              className="bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 font-black text-xs px-5 py-2 rounded-xl border border-red-300 dark:border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isLoading ? <Spinner /> : "Reject"}
            </button>
            <button
              onClick={() => onActionRequest(deposit.id, "APPROVED", "deposit")}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isLoading ? (
                <Spinner className="w-3 h-3 text-white" />
              ) : (
                "Approve"
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-end pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
            <StatusBadge status={deposit.status} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Merchant Card (only deposits) ────────────────────────────────────────────
function MerchantTxCard({
  tx,
  isMounted,
  loadingId,
  onActionRequest,
}: {
  tx: MerchantTx;
  isMounted: boolean;
  loadingId: string | null;
  onActionRequest: (id: string, status: "APPROVED" | "REJECTED", type: string) => void;
}) {
  const isPending = tx.status?.toUpperCase() === "PENDING";
  const methodName = getMethodName(tx);
  const isLoading = loadingId === tx.id;

  return (
    <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-gray-200 dark:border-slate-800/70 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/80 to-transparent" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 items-center min-w-0">
            <UserAvatar name={tx.user?.name || tx.accountName || "U"} />
            <div className="min-w-0">
              <h4 className="font-black text-sm truncate">
                {tx.user?.name ||
                  tx.accountName ||
                  tx.userProfileName ||
                  "User Account"}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                {tx.user?.email || "No email attached"}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
              +${Number(tx.amount).toFixed(2)}
            </p>
            {tx.convertedAmount != null && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                {tx.currency ?? "Rs"} {Number(tx.convertedAmount).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-[#0B1329] p-3 rounded-xl border border-gray-200 dark:border-slate-800/70 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Type
            </p>
            <p className="font-black text-emerald-600 dark:text-emerald-400">
              DEPOSIT
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Country
            </p>
            <p className="font-black font-mono uppercase">
              {tx.countryCode ?? "PK"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Rate
            </p>
            <p className="font-mono">
              1 USD = {tx.exchangeRate ?? "279.13"} {tx.currency ?? "PKR"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
              Date / Time
            </p>
            <p className="font-mono" suppressHydrationWarning>
              {tx.createdAt && isMounted
                ? new Date(tx.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-[#0B1329]/60 p-3 rounded-xl border border-gray-200 dark:border-[#1F2C56]/30 flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest">
                Account Route
              </span>
              {methodName && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider">
                  {methodName}
                </span>
              )}
            </div>
            <p className="font-mono">
              Title:{" "}
              <span className="font-bold">{tx.accountName ?? "N/A"}</span> | No:{" "}
              <span className="font-bold">{tx.accountNumber ?? "N/A"}</span>
            </p>
          </div>
          <div>
            {tx.screenshot ? (
              <ImagePreviewToggle
                imageUrl={tx.screenshot}
                title="Merchant Payment Proof"
              />
            ) : (
              <span className="text-gray-400 dark:text-gray-600 italic text-[11px]">
                No screenshot uploaded
              </span>
            )}
          </div>
        </div>
        {isPending ? (
          <div className="flex justify-end gap-2 pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
            <button
              onClick={() => onActionRequest(tx.id, "REJECTED", "merchant deposit")}
              disabled={isLoading}
              className="bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 font-black text-xs px-5 py-2 rounded-xl border border-red-300 dark:border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isLoading ? <Spinner /> : "Reject"}
            </button>
            <button
              onClick={() => onActionRequest(tx.id, "APPROVED", "merchant deposit")}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isLoading ? (
                <Spinner className="w-3 h-3 text-white" />
              ) : (
                "Approve"
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-end pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
            <StatusBadge status={tx.status} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DepositsPage({
  initialDeposits,
  serverMerchantTx,
}: {
  initialDeposits: Deposit[];
  serverMerchantTx?: MerchantTx[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryTab = searchParams.get("tab")?.toUpperCase();
  const initialTab: TabType =
    queryTab === "BINANCE"
      ? "Binance"
      : queryTab === "MERCHANT"
        ? "Merchant"
        : "TRC20";

  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits ?? []);
  const [merchantData, setMerchantData] = useState<MerchantTx[]>(
    serverMerchantTx ?? [],
  );
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isMounted, setIsMounted] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [modal, setModal] = useState<ModalState>({ show: false, title: "", message: "", onConfirm: () => {} });

  const triggerToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  // Merchant filters
  const [merchantSearch, setMerchantSearch] = useState("");
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<StatusFilterType>("ALL");
  const [loadingMerchantAction, setLoadingMerchantAction] = useState<string | null>(null);

  // Deposit (TRC20/Binance) filters
  const [depositSearch, setDepositSearch] = useState("");
  const [depositStatusFilter, setDepositStatusFilter] = useState<StatusFilterType>("ALL");
  const [loadingDepositAction, setLoadingDepositAction] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const t = setTimeout(() => setIsPageLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setDeposits(initialDeposits ?? []);
  }, [initialDeposits]);
  useEffect(() => {
    setMerchantData(serverMerchantTx ?? []);
  }, [serverMerchantTx]);

  useEffect(() => {
    const tab = searchParams.get("tab")?.toUpperCase();
    setActiveTab(
      tab === "BINANCE" ? "Binance" : tab === "MERCHANT" ? "Merchant" : "TRC20",
    );
  }, [searchParams]);

  // Reset deposit filters on tab change
  useEffect(() => {
    setDepositSearch("");
    setDepositStatusFilter("ALL");
  }, [activeTab]);

  // Header stats
  const headerStats = useMemo(() => {
    if (activeTab === "Merchant") {
      return {
        pending: merchantData.filter((tx) => tx.status?.toUpperCase() === "PENDING").length,
        approved: merchantData.filter((tx) =>
          ["COMPLETED", "APPROVED"].includes(tx.status?.toUpperCase()),
        ).length,
        rejected: merchantData.filter((tx) => tx.status?.toUpperCase() === "REJECTED").length,
      };
    }
    const upper = activeTab.toUpperCase();
    const tab = deposits.filter((d) => {
      const m = d.method?.toUpperCase() ?? "";
      const t = d.type?.toUpperCase() ?? "";
      if (upper === "TRC20")
        return m === "TRC20" || t === "TRC20" || (!m && t === "DEPOSIT");
      return m === upper || t === upper;
    });
    return {
      pending: tab.filter((d) => d.status?.toUpperCase() === "PENDING").length,
      approved: tab.filter((d) =>
        ["COMPLETED", "APPROVED"].includes(d.status?.toUpperCase()),
      ).length,
      rejected: tab.filter((d) => d.status?.toUpperCase() === "REJECTED").length,
    };
  }, [activeTab, deposits, merchantData]);

  const handleMerchantAction = async (id: string, actionStatus: "APPROVED" | "REJECTED") => {
    setLoadingMerchantAction(id);
    try {
      const result = actionStatus === "APPROVED"
        ? await approveMerchantTransaction(id)
        : await rejectMerchantTransaction(id);
      if (result?.error) throw new Error(result.error);
      triggerToast(`Transaction ${actionStatus.toLowerCase()} successfully!`, "success");
      router.refresh();
    } catch (err: any) {
      triggerToast(err.message || "Action failed.", "error");
    } finally {
      setLoadingMerchantAction(null);
    }
  };

  const handleDepositAction = async (id: string, actionStatus: "APPROVED" | "REJECTED") => {
    setLoadingDepositAction(id);
    try {
      const result = actionStatus === "APPROVED"
        ? await approveDeposit(id)
        : await rejectDeposit(id, "Admin Action");
      if (result?.error) throw new Error(result.error);
      triggerToast(`Request ${actionStatus.toLowerCase()} successfully!`, "success");
      router.refresh();
    } catch (err: any) {
      triggerToast(err.message || "Action failed.", "error");
    } finally {
      setLoadingDepositAction(null);
    }
  };

  const openDepositConfirm = (id: string, status: "APPROVED" | "REJECTED", type: string) => {
    setModal({
      show: true,
      title: `${status} Confirmation`,
      message: `Are you sure you want to ${status.toLowerCase()} this ${type} request?`,
      onConfirm: () => handleDepositAction(id, status),
    });
  };

  const openMerchantConfirm = (id: string, status: "APPROVED" | "REJECTED", type: string) => {
    setModal({
      show: true,
      title: `${status} Confirmation`,
      message: `Are you sure you want to ${status.toLowerCase()} this merchant ${type}?`,
      onConfirm: () => handleMerchantAction(id, status),
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/admin/deposits?tab=${tab.toLowerCase()}`, { scroll: false });
  };

  // Filter deposits (TRC20 / Binance)
  const upper = activeTab.toUpperCase();
  const tabDeposits = deposits.filter((d) => {
    const m = d.method?.toUpperCase() ?? "";
    const t = d.type?.toUpperCase() ?? "";
    if (upper === "TRC20")
      return m === "TRC20" || t === "TRC20" || (!m && t === "DEPOSIT");
    return m === upper || t === upper;
  });

  const filteredDeposits = tabDeposits.filter((d) => {
    const s = d.status?.toUpperCase();
    if (depositStatusFilter === "APPROVED" && s !== "COMPLETED" && s !== "APPROVED") return false;
    if (depositStatusFilter === "PENDING" && s !== "PENDING") return false;
    if (depositStatusFilter === "REJECTED" && s !== "REJECTED") return false;
    if (depositSearch.trim()) {
      const q = depositSearch.toLowerCase();
      return (
        d.user?.name?.toLowerCase().includes(q) ||
        d.user?.email?.toLowerCase().includes(q) ||
        d.txId?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter merchant (only deposits)
  const filteredMerchant = merchantData.filter((tx) => {
    const s = tx.status?.toUpperCase();
    if (merchantStatusFilter === "APPROVED" && s !== "COMPLETED" && s !== "APPROVED") return false;
    if (merchantStatusFilter === "PENDING" && s !== "PENDING") return false;
    if (merchantStatusFilter === "REJECTED" && s !== "REJECTED") return false;
    if (merchantSearch.trim()) {
      const q = merchantSearch.toLowerCase();
      return (
        tx.accountName?.toLowerCase().includes(q) ||
        tx.accountNumber?.includes(q) ||
        tx.id?.toLowerCase().includes(q) ||
        tx.user?.name?.toLowerCase().includes(q) ||
        tx.user?.email?.toLowerCase().includes(q) ||
        tx.resolvedMethodName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const depositPag = usePagination(filteredDeposits, [
    activeTab,
    depositStatusFilter,
    depositSearch,
  ]);
  const merchantPag = usePagination(filteredMerchant, [
    merchantStatusFilter,
    merchantSearch,
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen dark:bg-[#020618] text-gray-900 dark:text-white font-sans transition-colors duration-300">
      <ToastNotification toast={toast} />
      <ConfirmationModal modal={modal} onClose={() => setModal((prev) => ({ ...prev, show: false }))} />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Deposit Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              Unified management portal for all incoming user deposits.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-700 dark:text-amber-400 text-xs font-black">
                {headerStats.pending} Pending
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black">
                {headerStats.approved} Approved
              </span>
            </div>
            <div className="flex items-center gap-2 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-700 dark:text-red-400 text-xs font-black">
                {headerStats.rejected} Rejected
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 sm:flex gap-1.5 mb-6 bg-white dark:bg-[#0E172B] p-1.5 rounded-xl w-full sm:w-fit border border-gray-200 dark:border-slate-800/70 shadow-sm">
          {(["TRC20", "Binance", "Merchant"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all duration-200 w-full sm:w-auto ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                  activeTab === tab ? "bg-white/20" : "bg-gray-200 dark:bg-[#1F2C56]"
                }`}
              >
                {TAB_ICONS[tab]}
              </span>
              <span className="truncate">{tab}</span>
            </button>
          ))}
        </div>

        {/* ══════ MERCHANT TAB ══════ */}
        {activeTab === "Merchant" ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black">Merchant Deposits</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Review deposits from local payment methods.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm">
              <input
                type="text"
                value={merchantSearch}
                onChange={(e) => setMerchantSearch(e.target.value)}
                placeholder="Search by name, email, account number or ID..."
                className="bg-gray-50 dark:bg-[#0B1329] border border-gray-200 dark:border-slate-800/70 rounded-xl px-3 py-2 text-xs w-full max-w-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1 bg-gray-100 dark:bg-[#0B1329] p-1 rounded-xl border border-gray-200 dark:border-slate-800/70">
                  {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setMerchantStatusFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        merchantStatusFilter === f
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
              {filteredMerchant.length} result{filteredMerchant.length !== 1 ? "s" : ""} found
            </p>

            <div className="space-y-3">
              {isPageLoading && filteredMerchant.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : merchantPag.paginated.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-600 border border-dashed border-gray-300 dark:border-slate-800/70 rounded-2xl text-xs italic">
                  No merchant deposits match the current filters.
                </div>
              ) : (
                merchantPag.paginated.map((tx) => (
                  <MerchantTxCard
                    key={tx.id}
                    tx={tx}
                    isMounted={isMounted}
                    loadingId={loadingMerchantAction}
                    onActionRequest={openMerchantConfirm}
                  />
                ))
              )}
            </div>

            {merchantPag.totalPages > 1 && (
              <div className="w-full bg-white dark:bg-[#0E172B] rounded-xl border border-gray-200 dark:border-slate-800/70 overflow-x-auto">
                <PaginationBar
                  page={merchantPag.page}
                  totalPages={merchantPag.totalPages}
                  setPage={merchantPag.setPage}
                />
              </div>
            )}
          </div>
        ) : (
          /* ══════ TRC20 / BINANCE TAB ══════ */
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black">{activeTab} Deposits</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Review incoming {activeTab} deposit requests from users.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm">
              <input
                type="text"
                value={depositSearch}
                onChange={(e) => setDepositSearch(e.target.value)}
                placeholder="Search by name, email, TxID or ID..."
                className="bg-gray-50 dark:bg-[#0B1329] border border-gray-200 dark:border-slate-800/70 rounded-xl px-3 py-2 text-xs w-full max-w-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1 bg-gray-100 dark:bg-[#0B1329] p-1 rounded-xl border border-gray-200 dark:border-slate-800/70">
                  {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDepositStatusFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        depositStatusFilter === f
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
              {filteredDeposits.length} result{filteredDeposits.length !== 1 ? "s" : ""} found
            </p>

            <div className="space-y-3">
              {isPageLoading && filteredDeposits.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : depositPag.paginated.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-600 border border-dashed border-gray-300 dark:border-slate-800/70 rounded-2xl text-xs italic">
                  No {activeTab} deposits match the current filters.
                </div>
              ) : (
                depositPag.paginated.map((deposit) => (
                  <DepositCard
                    key={deposit.id}
                    deposit={deposit}
                    isMounted={isMounted}
                    activeTab={activeTab}
                    loadingId={loadingDepositAction}
                    onActionRequest={openDepositConfirm}
                  />
                ))
              )}
            </div>

            {depositPag.totalPages > 1 && (
              <div className="w-full bg-white dark:bg-[#0E172B] rounded-xl border border-gray-200 dark:border-slate-800/70 overflow-x-auto">
                <PaginationBar
                  page={depositPag.page}
                  totalPages={depositPag.totalPages}
                  setPage={depositPag.setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}