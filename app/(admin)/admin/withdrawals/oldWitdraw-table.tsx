"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { processWithdrawal } from "@/app/actions/admin/withdrawal";
import {
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
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
}

interface NotificationMessage {
  type: "success" | "error";
  text: string;
}

type StatusFilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

// ─── Sub-components (same as before) ─────────────────────────────────────────

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

// ─── Main Component with Search & Filter ─────────────────────────────────────

const ITEMS_PER_PAGE = 8;

export default function WithdrawalTable({
  requests,
}: {
  requests: WithdrawalRequest[];
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<NotificationMessage | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // Reset page when filters or requests change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, requests.length]);

  const handleAction = (id: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(id);
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await processWithdrawal(id, action);

        // Check if response indicates success
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
          // Optional: refresh page or update local state
        } else {
          // Extract error message safely
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

  // Filter logic
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

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

    // Search filter (name, email, id, destination)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req) => {
        const userName = req.user?.name?.toLowerCase() || "";
        const userEmail = req.user?.email?.toLowerCase() || "";
        const destination = req.destinationAddress?.toLowerCase() || "";
        const id = req.id?.toLowerCase() || "";
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          destination.includes(query) ||
          id.includes(query)
        );
      });
    }

    return filtered;
  }, [requests, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  return (
    <div className="space-y-5 w-full text-gray-900 dark:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed bottom-5 right-5 z-[100] animate-slide-up px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-black tracking-wide backdrop-blur-md border ${
            message.type === "success"
              ? "bg-emerald-500 border-emerald-600 text-white"
              : "bg-red-500 border-red-600 text-white"
          }`}
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
      )}

      {/* ─── Search + Filter Bar (added) ─── */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, ID or destination..."
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

      {/* Result count */}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
        {filteredRequests.length} result
        {filteredRequests.length !== 1 ? "s" : ""} found
      </p>

      {/* Main List */}
      {currentItems.length === 0 ? (
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
            const methodName = req.paymentMethod?.name ?? null;
            const isLoading = loadingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-[#0E172B] rounded-2xl border border-gray-200 dark:border-slate-800/70 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-rose-500/80 to-transparent" />

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
                      <p className="font-black uppercase text-rose-500">
                        WITHDRAWAL
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-0.5">
                        Country
                      </p>
                      <p className="font-black font-mono uppercase text-gray-900 dark:text-white">
                        {req.country ?? "PK"}
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

                  {/* Account Route Box */}
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
                      <p className="font-mono text-gray-700 dark:text-gray-300 text-[11px] break-all max-w-[260px] sm:max-w-[400px]">
                        {req.destinationAddress ||
                          `Title: ${displayTitleName} | No: ${req.accountNo ?? "N/A"}`}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-gray-400 dark:text-gray-600 italic text-[11px]">
                        No screenshot uploaded
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-1 border-t border-gray-200 dark:border-[#1F2C56]/40">
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E172B] px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/70 shadow-sm">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {Math.min(endIndex, filteredRequests.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredRequests.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
