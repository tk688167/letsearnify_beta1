"use client"

import { useState } from "react"
import { PencilIcon, TrashIcon, LinkIcon, BuildingOfficeIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

interface TasksTableProps {
    tasks: any[]
    onEdit: (task: any) => void
    onDelete: (id: string) => void
}

const ITEMS_PER_PAGE = 10

export default function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
    const [currentPage, setCurrentPage] = useState(1)

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100/50 dark:border-slate-700/30">
                    <BuildingOfficeIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">No tasks available</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-[240px] mx-auto">
                    Get started by creating a new task using the action button above.
                </p>
            </div>
        )
    }

    // Pagination Calculations
    const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentTasks = tasks.slice(startIndex, endIndex)

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
            
            {/* Mobile View — Cards Stack */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
                {currentTasks.map((task) => (
                    <div key={task.id} className="p-4 space-y-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        {task.type}
                                    </span>
                                    <span
                                        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                            task.status === "ACTIVE"
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        {task.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug break-words">
                                    {task.title}
                                </h4>
                                <div className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                    <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                    <span className="truncate">{task.company?.name || "Let's Earnify Official"}</span>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                                    {task.reward} ARN
                                </span>
                            </div>
                        </div>

                        {/* Mobile Actions Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800/50">
                            {task.link ? (
                                <a
                                    href={task.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    Go to target link
                                </a>
                            ) : (
                                <span className="text-[11px] text-gray-300 dark:text-slate-700 italic">No asset URL</span>
                            )}
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => onEdit(task)}
                                    className="p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all active:scale-90"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="p-2 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl transition-all active:scale-90"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View — Clean Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse m-0">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 select-none">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest w-[45%]">Task Specification</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center w-[15%]">Reward Value</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center w-[15%]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center w-[10%]">External Asset</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-right w-[15%]">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {currentTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-1 max-w-md">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-tight shrink-0">
                                                {task.type}
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[280px]">
                                                {task.title}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                            <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            <span>{task.company?.name || "Let's Earnify Official"}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                        {task.reward} ARN
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            task.status === "ACTIVE"
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/30"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    {task.link ? (
                                        <a
                                            href={task.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex p-2 bg-slate-50 dark:bg-slate-800/40 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                            title="View external asset URL"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-300 dark:text-slate-700 font-medium">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-1.5 text-gray-400 dark:text-slate-500">
                                        <button
                                            onClick={() => onEdit(task)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl hover:text-gray-700 dark:hover:text-white transition-all"
                                            title="Edit operational task"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl hover:text-red-500 dark:hover:text-red-400 transition-all"
                                            title="Delete operational task"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-gray-100 dark:border-slate-800/80 select-none">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                    Showing <span className="font-semibold text-gray-800 dark:text-white">{tasks.length > 0 ? startIndex + 1 : 0}</span> to{" "}
                    <span className="font-semibold text-gray-800 dark:text-white">{Math.min(endIndex, tasks.length)}</span> of{" "}
                    <span className="font-semibold text-gray-800 dark:text-white">{tasks.length}</span> entries
                </div>
                
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Previous Page"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    currentPage === page
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 dark:shadow-none"
                                        : "border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Next Page"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    )
}