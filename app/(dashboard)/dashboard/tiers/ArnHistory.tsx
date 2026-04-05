"use client"

import { CurrencyDollarIcon, SparklesIcon, UserPlusIcon, PuzzlePieceIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import { useCurrency } from "@/app/components/providers/CurrencyProvider"

interface Transaction {
    id: string;
    amount: number;
    arnMinted: number;
    type: string;
    method: string | null;
    description: string | null;
    createdAt: Date | string;
}

interface ArnHistoryProps {
    transactions: Transaction[];
}

export function ArnHistory({ transactions }: ArnHistoryProps) {
    const { formatCurrency } = useCurrency();

    const getIcon = (type: string, method: string | null) => {
        if (type === "SIGNUP_BONUS") return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
        if (type === "REFERRAL_COMMISSION") return <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />;
        if (type === "TASK_REWARD") return <PuzzlePieceIcon className="w-5 h-5 text-purple-500" />;
        if (type === "DEPOSIT") return <ArrowDownCircleIcon className="w-5 h-5 text-amber-500" />;
        if (type === "REWARD" && method === "SPIN") return <SparklesIcon className="w-5 h-5 text-indigo-500" />;
        return <SparklesIcon className="w-5 h-5 text-gray-500" />;
    };

    const getSourceLabel = (type: string, method: string | null) => {
        if (type === "SIGNUP_BONUS") return "Signup Bonus";
        if (type === "REFERRAL_COMMISSION") return "Referral Profit";
        if (type === "TASK_REWARD") return "Task Reward";
        if (type === "DEPOSIT") return "Direct Deposit";
        if (type === "REWARD" && method === "SPIN") return "Spin Reward";
        return type.replace("_", " ");
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-500" />
                    ARN Provenance Log
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                    Qualified Earnings
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4 text-center">Reward</th>
                            <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.length > 0 ? transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                            {getIcon(tx.type, tx.method)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                {getSourceLabel(tx.type, tx.method)}
                                            </div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                                                {tx.type}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                        {tx.description || "Qualified ARN contribution"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                            +{tx.arnMinted.toLocaleString()} ARN
                                        </span>
                                        {tx.amount > 0 && (
                                            <span className="text-[9px] text-gray-400 font-bold">
                                                ({formatCurrency(tx.amount)})
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="text-[11px] font-medium text-gray-900 dark:text-gray-200">
                                        {format(new Date(tx.createdAt), "MMM d, yyyy")}
                                    </div>
                                    <div className="text-[9px] text-gray-400">
                                        {format(new Date(tx.createdAt), "HH:mm")}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                                    No qualified ARN earnings found in your history.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
