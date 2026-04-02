"use client"

import PencilIcon from "@heroicons/react/24/outline/PencilIcon"
import TrashIcon from "@heroicons/react/24/outline/TrashIcon"
import LinkIcon from "@heroicons/react/24/outline/LinkIcon"
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon"

interface TasksTableProps {
    tasks: any[]
    onEdit: (task: any) => void
    onDelete: (id: string) => void
}

export default function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                    <BuildingOfficeIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">No Tasks Available</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[200px]">Create a new task to start rewarding your platform users.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                {tasks.map((task) => (
                    <div key={task.id} className="p-5 space-y-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">{task.type}</div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{task.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                                task.status === "ACTIVE" 
                                ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                            }`}>
                                {task.status}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reward Value</span>
                                <span className="font-black text-green-600 dark:text-green-400 text-sm tracking-tight">{task.reward} ARN</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onEdit(task)} 
                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 rounded-xl text-gray-600 dark:text-slate-400 transition-all active:scale-90"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => onDelete(task.id)} 
                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white rounded-xl text-red-500 transition-all active:scale-90"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md z-10">
                        <tr className="border-b border-gray-200 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Definition</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reward</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Involvement</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {tasks.map((task) => (
                            <tr key={task.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col max-w-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                {task.type}
                                            </span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-slate-500 line-clamp-1 flex items-center gap-1.5 leading-tight">
                                            <BuildingOfficeIcon className="w-3 h-3 shrink-0" />
                                            {task.company?.name || "Let's Earnify Official"}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="font-black text-green-600 dark:text-green-400 text-sm">{task.reward} ARN</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                        {task.link ? (
                                            <a 
                                                href={task.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-gray-400 hover:text-indigo-600 transition-all active:scale-95"
                                                title="Visit External Link"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                                        task.status === "ACTIVE" 
                                        ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20" 
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                                    }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onEdit(task)} 
                                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-400 transition-all hover:scale-110 active:scale-90"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(task.id)} 
                                            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-all hover:scale-110 active:scale-90"
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
        </div>
    )
}
