"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { processWithdrawal } from "@/app/actions/admin/withdrawal";
import {
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: string;
  type: "CRYPTO" | "MERCHANT";
  destinationAddress: string;
  method: string;
  createdAt: string | Date;
  user: {
    id: string;
    email: string;
    balance: number;
    name: string | null;
  };
  convertedAmount: number | null;
  exchangeRate: number | null;
  currency: string | null;
  paymentMethod: { name: string } | null;
  country?: string;
  rate?: number;
  accountNo?: string;
  accountName?: string;
  detectedMethod?: string; // New field for detected merchant method
  rawMethod?: string; // Raw method from DB
}

interface NotificationMessage {
  type: "success" | "error";
  text: string;
}

type TabType = "TRC20" | "BINANCE" | "MERCHANT";
type StatusFilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;
const TAB_ICONS: Record<TabType, string> = {
  TRC20: "T",
  BINANCE: "B",
  MERCHANT: "M",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

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
  const isApproved = s === "COMPLETED" || s === "APPROVED";
  const isRejected = s === "REJECTED";

  if (s === "PENDING") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        isApproved
          ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20"
          : isRejected
            ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20"
            : "bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-gray-500"}`}
      />
      {isApproved ? "APPROVED" : "REJECTED"}
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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 dark:bg-[#1F2C56] hover:bg-gray-200 dark:hover:bg-[#2A3A6A] text-gray-600 dark:text-gray-300 transition-all border border-gray-200 dark:border-[#1F2C56]"
      title={`Copy ${label || "text"}`}
    >
      <DocumentDuplicateIcon className="w-3 h-3" />
      {copied ? "Copied!" : "Copy"}
    </button>
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

function PaginationBar({
  currentPage,
  totalPages,
  setCurrentPage,
  startIndex,
  endIndex,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E172B] px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm">
      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
        Showing{" "}
        <span className="font-bold text-gray-900 dark:text-white">
          {startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="font-bold text-gray-900 dark:text-white">
          {Math.min(endIndex, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-bold text-gray-900 dark:text-white">
          {totalItems}
        </span>{" "}
        results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeftIcon className="w-4 h-4" />
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
              onClick={() => setCurrentPage(p as number)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === p
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function WithdrawalTable({
  requests,
}: {
  requests: WithdrawalRequest[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<NotificationMessage | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Tab state
  const queryTab = searchParams.get("tab")?.toUpperCase();
  const initialTab: TabType =
    queryTab === "TRC20"
      ? "TRC20"
      : queryTab === "BINANCE"
        ? "BINANCE"
        : queryTab === "MERCHANT"
          ? "MERCHANT"
          : "TRC20";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");

  useEffect(() => {
    setIsMounted(true);
    const t = setTimeout(() => setIsPageLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const tab = searchParams.get("tab")?.toUpperCase();
    setActiveTab(
      tab === "TRC20"
        ? "TRC20"
        : tab === "BINANCE"
          ? "BINANCE"
          : tab === "MERCHANT"
            ? "MERCHANT"
            : "TRC20",
    );
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab, requests.length]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/admin/withdrawals?tab=${tab.toLowerCase()}`, {
      scroll: false,
    });
  };

  const handleAction = (id: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(id);
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await processWithdrawal(id, action);

        if (
          res &&
          typeof res === "object" &&
          "success" in res &&
          res.success === true
        ) {
          setMessage({
            type: "success",
            text: `Request ${action === "APPROVE" ? "Approved" : "Rejected"} successfully.`,
          });
          router.refresh();
        } else {
          const errorMsg =
            res && typeof res === "object" && "error" in res && res.error
              ? String(res.error)
              : "Action failed.";
          setMessage({ type: "error", text: errorMsg });
        }
      } catch (err) {
        console.error("Withdrawal action error:", err);
        setMessage({
          type: "error",
          text:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        });
      } finally {
        setLoadingId(null);
      }
    });
  };

  // ─── Filter Logic ──────────────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Tab filter
    if (activeTab === "TRC20") {
      filtered = filtered.filter(
        (req) => req.type === "CRYPTO" && req.method?.toUpperCase() === "TRC20",
      );
    } else if (activeTab === "BINANCE") {
      filtered = filtered.filter(
        (req) =>
          req.type === "CRYPTO" && req.method?.toUpperCase() === "BINANCE",
      );
    } else if (activeTab === "MERCHANT") {
      filtered = filtered.filter((req) => req.type === "MERCHANT");
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((req) => {
        const s = req.status?.toUpperCase();
        if (statusFilter === "PENDING") return s === "PENDING";
        if (statusFilter === "APPROVED")
          return s === "COMPLETED" || s === "APPROVED";
        if (statusFilter === "REJECTED") return s === "REJECTED";
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req) => {
        const userName = req.user?.name?.toLowerCase() || "";
        const userEmail = req.user?.email?.toLowerCase() || "";
        const destination = req.destinationAddress?.toLowerCase() || "";
        const id = req.id?.toLowerCase() || "";
        const accountNo = req.accountNo?.toLowerCase() || "";
        const detectedMethod = req.detectedMethod?.toLowerCase() || "";
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          destination.includes(query) ||
          id.includes(query) ||
          accountNo.includes(query) ||
          detectedMethod.includes(query)
        );
      });
    }

    return filtered;
  }, [requests, activeTab, statusFilter, searchQuery]);

  // ─── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  // ─── Header Stats ──────────────────────────────────────────────────────────

  const headerStats = useMemo(() => {
    let tabData;
    if (activeTab === "TRC20") {
      tabData = requests.filter(
        (r) => r.type === "CRYPTO" && r.method?.toUpperCase() === "TRC20",
      );
    } else if (activeTab === "BINANCE") {
      tabData = requests.filter(
        (r) => r.type === "CRYPTO" && r.method?.toUpperCase() === "BINANCE",
      );
    } else if (activeTab === "MERCHANT") {
      tabData = requests.filter((r) => r.type === "MERCHANT");
    } else {
      tabData = requests;
    }

    return {
      pending: tabData.filter((r) => r.status?.toUpperCase() === "PENDING")
        .length,
      approved: tabData.filter((r) =>
        ["COMPLETED", "APPROVED"].includes(r.status?.toUpperCase()),
      ).length,
      rejected: tabData.filter((r) => r.status?.toUpperCase() === "REJECTED")
        .length,
    };
  }, [requests, activeTab]);

  // ─── Get Route Display Name ──────────────────────────────────────────────

  const getRouteDisplayName = (req: WithdrawalRequest) => {
    if (req.type === "CRYPTO") {
      const method = req.method?.toUpperCase() || "";
      if (method === "TRC20") return "TRC20";
      if (method === "BINANCE") return "Binance";
      return method || "Crypto";
    } else {
      // For MERCHANT - use detected method from server
      if (req.detectedMethod) {
        return req.detectedMethod; // This will be "EasyPaisa" or "JazzCash" only
      }

      // Fallback detection
      const accountNo = req.accountNo || "";
      if (accountNo.startsWith("03")) {
        // Try to detect from raw method or payment method name
        if (req.rawMethod) {
          if (req.rawMethod.toLowerCase().includes("easypaisa"))
            return "EasyPaisa";
          if (req.rawMethod.toLowerCase().includes("jazzcash"))
            return "JazzCash";
        }
        // Default to EasyPaisa if no specific info
        return "EasyPaisa";
      }
      return "Local Agent";
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen dark:bg-[#020618] text-gray-900 dark:text-white font-sans transition-colors duration-300">
      {/* Toast Notification */}
      {message && (
        <div className="fixed bottom-5 right-5 z-[100] animate-slide-up px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-black tracking-wide backdrop-blur-md border">
          <div
            className={`${
              message.type === "success"
                ? "bg-emerald-500 border-emerald-600 text-white"
                : "bg-red-500 border-red-600 text-white"
            } flex items-center gap-3 px-5 py-3 rounded-xl`}
          >
            {message.type === "success" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {activeTab === "MERCHANT"
                ? "Merchant Withdraw"
                : activeTab === "TRC20"
                  ? "TRC20 Withdraw"
                  : activeTab === "BINANCE"
                    ? "Binance Withdraw"
                    : "Withdrawal Hub"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              {activeTab === "MERCHANT"
                ? "Review and manage all merchant withdrawal requests from local payment methods."
                : activeTab === "TRC20"
                  ? "Review and manage all TRC20 crypto withdrawal requests."
                  : activeTab === "BINANCE"
                    ? "Review and manage all Binance crypto withdrawal requests."
                    : "Unified management portal for all user withdrawal requests."}
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
        <div className="grid grid-cols-3 gap-1.5 mb-6 bg-white dark:bg-[#0E172B] p-1.5 rounded-xl w-full border border-gray-200 dark:border-slate-800/70 shadow-sm">
          {(["TRC20", "BINANCE", "MERCHANT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-black transition-all duration-200 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span>{TAB_ICONS[tab]}</span>
              <span className="truncate">{tab}</span>
            </button>
          ))}
        </div>

        {/* ─── Search + Filter Bar ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm mb-5">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ID, account or destination..."
              className="bg-gray-50 dark:bg-[#0B1329] border border-gray-200 dark:border-slate-800/70 rounded-xl pl-9 pr-3 py-2 text-xs w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-[#0B1329] p-1 rounded-xl border border-gray-200 dark:border-slate-800/70">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                    statusFilter === filter
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>

        {/* ─── Result Count ───────────────────────────────────────────────────── */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mb-4">
          {filteredRequests.length} result
          {filteredRequests.length !== 1 ? "s" : ""} found
        </p>

        {/* ─── Main List ──────────────────────────────────────────────────────── */}
        {isPageLoading && filteredRequests.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600 border border-dashed border-gray-300 dark:border-slate-800/70 rounded-2xl text-xs italic">
            <BanknotesIcon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
            No withdrawal requests match the current filters.
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {currentItems.map((req) => {
              const formattedUsd = Number(req.amount || 0).toFixed(2);
              const formattedPkr = Number(req.convertedAmount || 0).toFixed(2);
              const dbUserName = req.user?.name ?? "";
              const dbUserEmail = req.user?.email ?? "No email available";
              const displayTitleName =
                dbUserName || dbUserEmail.split("@")[0] || "Anonymous User";
              const isLoading = loadingId === req.id;
              const isCrypto = req.type === "CRYPTO";
              const displayAddress = req.destinationAddress || "N/A";
              const accountNumber = req.accountNo || "N/A";
              const routeDisplayName = getRouteDisplayName(req);

              // Check if it's a local mobile wallet (EasyPaisa or JazzCash)
              const isLocalMobile =
                routeDisplayName === "EasyPaisa" ||
                routeDisplayName === "JazzCash";

              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-[#0E172B] rounded-2xl border border-gray-200 dark:border-slate-800/70 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    className={`h-0.5 w-full ${
                      isCrypto
                        ? "bg-gradient-to-r from-blue-500/80 to-transparent"
                        : isLocalMobile
                          ? "bg-gradient-to-r from-green-500/80 to-transparent"
                          : "bg-gradient-to-r from-purple-500/80 to-transparent"
                    }`}
                  />

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3 items-center min-w-0">
                        <UserAvatar name={displayTitleName} />
                        <div className="min-w-0">
                          <h4 className="font-black text-sm truncate capitalize">
                            {displayTitleName}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                            {dbUserEmail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-black text-base text-rose-500">
                          -${formattedUsd}
                        </p>
                        {req.convertedAmount != null && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                            {req.currency ?? "PKR"} {formattedPkr}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-[#0B1329] p-3 rounded-xl border border-gray-200 dark:border-slate-800/70 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
                          Type
                        </p>
                        <p
                          className={`font-black uppercase ${
                            isCrypto
                              ? "text-blue-500"
                              : isLocalMobile
                                ? "text-green-400"
                                : "text-purple-500"
                          }`}
                        >
                          {isCrypto
                            ? "CRYPTO"
                            : isLocalMobile
                              ? "MOBILE WALLET"
                              : "MERCHANT"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
                          Route
                        </p>
                        <p className="font-black font-mono uppercase text-gray-900 dark:text-white text-[11px]">
                          {routeDisplayName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
                          Rate
                        </p>
                        <p className="font-mono text-gray-700 dark:text-gray-300">
                          1 USD ={" "}
                          {req.rate ? Number(req.rate).toFixed(2) : "279.00"}{" "}
                          {req.currency ?? "PKR"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
                          Date / Time
                        </p>
                        <p
                          className="font-mono text-gray-700 dark:text-gray-300"
                          suppressHydrationWarning
                        >
                          {req.createdAt && isMounted
                            ? new Date(req.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Account Route Box with Copy Button */}
                    <div
                      className={`p-3 rounded-xl border flex flex-wrap justify-between items-center gap-2 text-xs ${
                        isLocalMobile
                          ? "bg-green-50 dark:bg-[#0B1329]/20 border-green-200 dark:border-[#1F2C56]/30"
                          : "bg-gray-50 dark:bg-[#0B1329]/60 border-gray-200 dark:border-[#1F2C56]/30"
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-black uppercase text-[10px] tracking-widest ${
                              isLocalMobile
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            Account Route
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                              isLocalMobile
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {routeDisplayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-gray-700 dark:text-gray-300 text-[11px] break-all">
                            {isCrypto ? (
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {displayAddress}
                              </span>
                            ) : (
                              <>
                                Title:{" "}
                                <span
                                  className={`font-bold ${
                                    isLocalMobile
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-purple-600 dark:text-purple-400"
                                  }`}
                                >
                                  {req.accountName || displayTitleName}
                                </span>{" "}
                                | No:{" "}
                                <span
                                  className={`font-bold ${
                                    isLocalMobile
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-purple-600 dark:text-purple-400"
                                  }`}
                                >
                                  {accountNumber}
                                </span>
                              </>
                            )}
                          </p>
                          <CopyButton
                            text={isCrypto ? displayAddress : accountNumber}
                            label={isCrypto ? "Address" : "Account Number"}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 md:block hidden">
                        <span
                          className={`italic text-[11px] ${
                            isLocalMobile
                              ? "text-green-400 dark:text-green-600"
                              : "text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {isCrypto
                            ? "Blockchain"
                            : isLocalMobile
                              ? "Mobile Wallet"
                              : "Local Transfer"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge (right side) + Action Buttons */}
                    <div className="flex justify-end items-center gap-3 pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
                      <StatusBadge status={req.status} />

                      {req.status?.toUpperCase() === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, "REJECT")}
                            disabled={!!loadingId}
                            className="bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 font-black text-xs px-5 py-2 rounded-xl border border-red-300 dark:border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isLoading ? (
                              <Spinner />
                            ) : (
                              <>
                                <XCircleIcon className="w-3.5 h-3.5" />
                                Reject
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "APPROVE")}
                            disabled={!!loadingId}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isLoading ? (
                              <Spinner className="w-3 h-3 text-white" />
                            ) : (
                              <>
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Approve
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination ────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-5">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredRequests.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
