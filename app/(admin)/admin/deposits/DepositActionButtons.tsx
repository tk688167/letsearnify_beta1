"use client"; // Client side interactivity ke liye zaruri hai

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { approveDeposit, rejectDeposit } from "@/app/actions/admin/deposits";

type Props = {
  transactionId: string;
  compact?: boolean;
  onSuccess?: (status: "COMPLETED" | "REJECTED" | "PENDING") => void;
};

export default function DepositActionButtons({ transactionId, compact = false, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: "APPROVE" | "REJECT") => {
    startTransition(async () => {
      try {
        // Direct Server Action ko call kar rahe hain
        const result = action === "APPROVE" 
          ? await approveDeposit(transactionId) 
          : await rejectDeposit(transactionId, "Admin Rejected");

        if (result?.success) {
          if (onSuccess) onSuccess(action === "APPROVE" ? "COMPLETED" : "REJECTED");
          // Page ke data ko fresh fetch karne ke liye
          router.refresh(); 
        } else {
          throw new Error(result?.error || "Action failed");
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
        alert(`Failed to ${action.toLowerCase()} deposit: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  };

  return (
    <div className={`flex ${compact ? "justify-end" : ""} gap-2 items-center`}>
      {/* Approve Button */}
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={isPending}
        className={`flex items-center justify-center gap-1.5 ${compact ? "px-3 py-1.5 rounded-md text-[11px]" : "w-full py-2.5 rounded-xl text-xs"} ${isPending ? "bg-green-600/50" : "bg-green-600 hover:bg-green-700"} text-white font-bold transition-all disabled:opacity-50`}
      >
        {isPending ? <ClockIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
        {isPending ? "Processing..." : "Approve"}
      </button>

      {/* Reject Button */}
      <button
        onClick={() => handleAction("REJECT")}
        disabled={isPending}
        className={`flex items-center justify-center gap-1.5 ${compact ? "px-3 py-1.5 rounded-md text-[11px]" : "w-full py-2.5 rounded-xl text-xs"} ${isPending ? "bg-red-950/20" : "bg-[#172554]/40 hover:bg-red-950/30"} text-red-400 border border-red-500/20 font-bold transition-all disabled:opacity-50`}
      >
        {isPending ? <ClockIcon className="w-3.5 h-3.5 animate-spin" /> : <XCircleIcon className="w-3.5 h-3.5" />}
        {isPending ? "Processing..." : "Reject"}
      </button>
    </div>
  );
}