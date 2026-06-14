"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon } from "@heroicons/react/24/solid";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import {
  approveTaskCompletion,
  rejectTaskCompletion,
} from "@/app/actions/admin/task-approvals";

// 1. Strict TypeScript Interfaces for Production Safety
export interface TaskUser {
  id: string;
  name: string | null;
  email: string | null;
}

export interface TaskCampaign {
  id: string;
  name: string;
  reward: number;
  isPremium?: boolean;
  type?: string;
}

export interface TaskCompletion {
  id: string;
  proof: string | null;
  screenshotUrl?: string | null;
  remarks: string | null;
  userNotes?: string | null;
  submittedAt: string | Date;
  createdAt?: string | Date;
  pointsEarned?: number | null;
  points?: number | null;
  user?: TaskUser | null;
  userName?: string;
  userEmail?: string;
  campaign?: TaskCampaign | null;
  task?: { title: string; reward: number; isPremium?: boolean; type?: string } | null;
}

type Props = {
  completions: TaskCompletion[];
  onApprovalComplete?: (completionId: string) => void;
};

function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-white transition-all z-10"
        aria-label="Close lightbox"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img
        src={url}
        alt="Task proof screenshot"
        className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg sm:rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function RejectModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  const presets = [
    "Proof unclear",
    "Wrong task",
    "Duplicate submission",
    "Fake screenshot",
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl border border-transparent dark:border-slate-800/60 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            Reject Submission
          </h3>
          <button
            onClick={onCancel}
            className="sm:hidden p-1 text-gray-400"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Select a reason or write your own. User will be notified.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={`${p}-${idx}`}
              type="button"
              onClick={() => setReason(p)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                reason === p
                  ? "bg-red-600 text-white"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Custom reason (optional)..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 resize-none transition-all border border-transparent"
        />

        <div className="flex gap-2.5 pt-1 pb-4 sm:pb-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || "Rejected by Admin")}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isPending ? (
              <ClockIcon className="w-4 h-4 animate-spin" />
            ) : (
              <XCircleIcon className="w-4 h-4" />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletionCard({
  completion,
  onApprove,
  onReject,
  isProcessing,
  actionStatus,
}: {
  completion: any; 
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
  actionStatus?: "APPROVING" | "REJECTING";
}) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Unified Variable mapping to avoid structural leakage
  const userName =
    completion?.user?.name || completion?.userName || "Unknown User";
  const userEmail =
    completion?.user?.email || completion?.userEmail || "No Email Provided";
  const taskTitle =
    completion?.campaign?.name || completion?.task?.title || "Task Completion";

  const rawPoints =
    completion?.task?.reward ??
    completion?.campaign?.reward ??
    (completion?.pointsEarned && Number(completion.pointsEarned) !== 0
      ? completion.pointsEarned
      : null) ??
    (completion?.points && Number(completion.points) !== 0
      ? completion.points
      : null) ??
    0;

  const pointsEarned =
    typeof rawPoints === "string" ? parseFloat(rawPoints) : Number(rawPoints);

  const imageUrl = completion?.proof || completion?.screenshotUrl || null;
  const remarks = completion?.remarks || completion?.userNotes || null;
  const submittedAt = completion?.submittedAt || completion?.createdAt;
  const shortId = completion?.id
    ? completion.id.slice(-6).toUpperCase()
    : "XXXXXX";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Premium Check Logic (Aapke schema ke mutabiq true/false ya string match check karega)
  const isPremiumTask = 
    completion?.task?.isPremium || 
    completion?.campaign?.isPremium || 
    completion?.task?.type === "PREMIUM" || 
    completion?.campaign?.type === "PREMIUM";

  return (
    <>
      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl transition-all duration-200 overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800/60 ${
          isProcessing ? "opacity-60 pointer-events-none" : "hover:shadow-md"
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm">
              {initials || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                    {userEmail}
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-md text-[10px] font-bold">
                  #{shortId}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-sm truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[280px]">
                  {taskTitle}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-sm whitespace-nowrap">
                  +
                  {pointsEarned % 1 === 0
                    ? pointsEarned
                    : pointsEarned.toFixed(2)}{" "}
                  ARN
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-gray-50 dark:border-slate-800/40 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {/* Premium / Basic Badge Indicator instead of Proof Button */}
              {isPremiumTask ? (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold shadow-sm">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Premium</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold">
                  <CheckBadgeIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Basic</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-0.5 px-2 py-1.5 text-gray-400 dark:text-slate-500 rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                {expanded ? (
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                )}
                <span>{expanded ? "Less" : "Details"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full xs:w-auto justify-end">
              {actionStatus ? (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    actionStatus === "APPROVING"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <ClockIcon className="w-3.5 h-3.5 animate-spin" /> Process…
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onReject}
                    disabled={isProcessing}
                    className="flex-1 xs:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all disabled:opacity-40"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="flex-1 xs:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="px-4 sm:px-5 pb-4 border-t border-gray-50 dark:border-slate-800/60 pt-3 space-y-3 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                    Submitted At
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {submittedAt
                      ? new Date(submittedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                    Estimated Value
                  </p>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">
                    {pointsEarned % 1 === 0
                      ? pointsEarned
                      : pointsEarned.toFixed(2)}{" "}
                    ARN (${((pointsEarned || 0) / 10).toFixed(2)})
                  </p>
                </div>
              </div>
            </div>

            {remarks && (
              <div className="flex items-start gap-2 pt-1">
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">
                    User Note
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 italic bg-gray-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl break-words">
                    "{remarks}"
                  </p>
                </div>
              </div>
            )}

            {/* Lightbox preview capability is retained when admin expands details */}
            {imageUrl && (
              <div className="pt-1">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1.5">
                  Proof Container Image
                </p>
                <button
                  type="button"
                  onClick={() => setLightboxUrl(imageUrl)}
                  className="relative block w-full rounded-xl overflow-hidden group border border-gray-100 dark:border-slate-800/40 bg-gray-100 dark:bg-slate-850 min-h-[80px]"
                >
                  <img
                    src={imageUrl}
                    alt="Proof Preview"
                    className="w-full object-cover group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <MagnifyingGlassIcon className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function ApprovalsPanel({
  completions = [],
  onApprovalComplete,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingSet, setProcessingSet] = useState<Set<string>>(new Set());
  const [actionStatusMap, setActionStatusMap] = useState<
    Map<string, "APPROVING" | "REJECTING">
  >(new Map());
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    return completions.filter((c) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      const name = c?.user?.name || c?.userName || "";
      const email = c?.user?.email || c?.userEmail || "";
      const task = c?.campaign?.name || c?.task?.title || "";
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        task.toLowerCase().includes(q)
      );
    });
  }, [completions, search]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const markProcessing = (id: string, status: "APPROVING" | "REJECTING") => {
    setProcessingSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setActionStatusMap((prev) => {
      const next = new Map(prev);
      next.set(id, status);
      return next;
    });
  };

  const unmarkProcessing = (id: string) => {
    setProcessingSet((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setActionStatusMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleApprove = (completionId: string) => {
    if (processingSet.has(completionId)) return;

    markProcessing(completionId, "APPROVING");
    onApprovalComplete?.(completionId);

    startTransition(async () => {
      try {
        const result = await approveTaskCompletion(completionId);
        if (!result?.success) router.refresh();
      } catch (err) {
        console.error("Single Approval failed:", err);
        router.refresh();
      } finally {
        unmarkProcessing(completionId);
      }
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget || processingSet.has(rejectTarget)) return;
    const id = rejectTarget;
    setRejectTarget(null);

    markProcessing(id, "REJECTING");
    onApprovalComplete?.(id);

    startTransition(async () => {
      try {
        const result = await rejectTaskCompletion(id, reason);
        if (!result?.success) router.refresh();
      } catch (err) {
        console.error("Rejection failed:", err);
        router.refresh();
      } finally {
        unmarkProcessing(id);
      }
    });
  };

  const handleApproveAll = () => {
    if (!filtered.length) return;
    if (
      !confirm(
        `Are you sure you want to approve all ${filtered.length} pending submissions concurrently?`,
      )
    )
      return;

    startTransition(async () => {
      filtered.forEach((item) => {
        markProcessing(item.id, "APPROVING");
        onApprovalComplete?.(item.id);
      });

      try {
        const promises = filtered.map((item) => approveTaskCompletion(item.id));
        await Promise.all(promises);
      } catch (error) {
        console.error("Error batch processing completions:", error);
      } finally {
        filtered.forEach((item) => unmarkProcessing(item.id));
        router.refresh();
      }
    });
  };

  if (!completions || completions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <CheckBadgeIcon className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          All Clean!
        </h3>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          No pending task verifications.
        </p>
      </div>
    );
  }

  return (
    <>
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isPending={isPending}
        />
      )}

      <div className="space-y-4 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-gray-100 dark:border-slate-800/40">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or task..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); 
              }}
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border border-gray-200/60 dark:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
              {filtered.length} pending requests
            </span>
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={handleApproveAll}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
              >
                <CheckBadgeIcon className="w-4 h-4" />
                Approve All
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs sm:text-sm text-gray-400 bg-gray-50/20 rounded-2xl border border-dashed dark:border-slate-800">
            No pending submissions found matching "{search}"
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {paginatedItems.map((completion) => (
                <CompletionCard
                  key={completion.id}
                  completion={completion}
                  onApprove={() => handleApprove(completion.id)}
                  onReject={() => setRejectTarget(completion.id)}
                  isProcessing={processingSet.has(completion.id)}
                  actionStatus={actionStatusMap.get(completion.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-slate-800/60 pt-4 mt-2">
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 order-2 sm:order-1">
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filtered.length}
                  </span>{" "}
                  entries
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-600 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none flex justify-center transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 min-w-[80px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-600 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none flex justify-center transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}