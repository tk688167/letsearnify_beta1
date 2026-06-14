"use client";

import {
  useState,
  useEffect,
  useTransition,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import TasksTable from "./TasksTable";
import ApprovalsPanel from "./ApprovalsPanel";
import TaskModal from "./TaskModal";
import { deleteTask } from "@/app/actions/admin/tasks";

interface TaskAdminClientProps {
  tasks: any[];
  companies: any[];
  pendingCompletions: any[];
}

type TabType = "BASIC" | "PREMIUM" | "APPROVALS" | "COMPANIES";

function TabSyncFromURL({ onTab }: { onTab: (tab: TabType) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "approvals") onTab("APPROVALS");
  }, [searchParams, onTab]);
  return null;
}

export default function TaskAdminClient({
  tasks: initialTasks,
  companies,
  pendingCompletions: initialCompletions,
}: TaskAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("APPROVALS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [defaultType, setDefaultType] = useState<string>("BASIC");
  const [localTasks, setLocalTasks] = useState(initialTasks);
  const [localCompletions, setLocalCompletions] = useState(initialCompletions);

  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);
  useEffect(() => {
    setLocalCompletions(initialCompletions);
  }, [initialCompletions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this task?")) return;
    const snapshot = localTasks;
    setLocalTasks((prev) => prev.filter((t: any) => t.id !== id));
    startTransition(async () => {
      const res = await deleteTask(id);
      if (!res?.success) {
        setLocalTasks(snapshot);
        alert(res?.error || "Failed to delete task");
      } else {
        router.refresh();
      }
    });
  };

  const handleSuccess = (updatedTask: any) => {
    setIsModalOpen(false);
    setLocalTasks((prev) => {
      const exists = prev.find((t: any) => t.id === updatedTask.id);
      if (exists)
        return prev.map((t: any) =>
          t.id === updatedTask.id ? updatedTask : t,
        );
      return [updatedTask, ...prev];
    });
    router.refresh();
  };

  const handleApprovalComplete = useCallback((completionId: string) => {
    setLocalCompletions((prev) =>
      prev.filter((c: any) => c.id !== completionId),
    );
  }, []);

  const openCreateModal = (type: string) => {
    setDefaultType(type);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const basicTasks = localTasks.filter(
    (t: any) => t.type === "BASIC" || !["PREMIUM"].includes(t.type),
  );
  const premiumTasks = localTasks.filter((t: any) => t.type === "PREMIUM");

  const tabs = [
    {
      id: "BASIC",
      label: "Basic Tasks",
      shortLabel: "Basic",
      icon: ClipboardDocumentListIcon,
      count: basicTasks.length,
      urgent: false,
      color: "violet",
    },
    {
      id: "PREMIUM",
      label: "Premium Tasks",
      shortLabel: "Premium",
      icon: ShieldCheckIcon,
      count: premiumTasks.length,
      urgent: false,
      color: "amber",
    },
    {
      id: "APPROVALS",
      label: "Approvals",
      shortLabel: "Approvals",
      icon: UserGroupIcon,
      count: localCompletions.length,
      urgent: localCompletions.length > 0,
      color: "indigo",
    },
    {
      id: "COMPANIES",
      label: "Companies",
      shortLabel: "Companies",
      icon: BuildingOfficeIcon,
      count: companies.length,
      urgent: false,
      color: "emerald",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 antialiased selection:bg-indigo-500/30">
      <Suspense fallback={null}>
        <TabSyncFromURL onTab={setActiveTab} />
      </Suspense>

      {/* Premium Header Design */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight">
              Task Management
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Review internal worker submissions, scale your micro-earning
            strategies, and align enterprise platform utilities.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3 self-start md:self-center shrink-0">
          {localCompletions.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("APPROVALS")}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold shadow-sm backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {localCompletions.length} action item
              {localCompletions.length > 1 ? "s" : ""}
            </motion.button>
          )}
        </div>
      </div>

      {/* Modern Tab Bar Container with Native Hide Scrollbars */}
      <div className="bg-slate-100/80 bg-white dark:bg-slate-900/50 p-1.5  rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-lg flex gap-1.5 overflow-x-auto touch-pan-x select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center justify-between sm:justify-start cursor-pointer gap-2.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 w-full sm:w-auto outline-none tap-highlight-transparent ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F2C56] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {/* Framer Motion Sliding Indicator Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Left Side: Icon + Label Container */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Icon Container Box */}
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "bg-white/20 scale-105 text-white"
                      : "bg-gray-200 dark:bg-[#1F2C56] text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>

                {/* Responsive Labels */}
                <span className="hidden sm:inline truncate font-black">
                  {tab.label}
                </span>
                <span className="sm:hidden truncate font-black">
                  {tab.shortLabel}
                </span>
              </div>

              {/* Right Side: Notification Count Badge */}
              {tab.count > 0 && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-md text-[9px] font-black shadow-sm shrink-0 ${
                    tab.urgent
                      ? "bg-rose-500 text-white animate-pulse"
                      : isActive
                        ? "bg-white text-blue-600"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Workspace Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/70 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden min-h-[450px] transition-all">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {activeTab === "BASIC" && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                        Basic Task
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Public layer global workflows for regular user pools
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openCreateModal("BASIC")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/10 dark:shadow-indigo-600/20 transition-all self-stretch sm:self-center"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Basic Task</span>
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <TasksTable
                    tasks={basicTasks}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {activeTab === "PREMIUM" && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                        Premium Tier Activations
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        High-tier dedicated escrow tasks and exclusive
                        operations
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openCreateModal("PREMIUM")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-amber-600/10 dark:shadow-amber-600/20 transition-all self-stretch sm:self-center"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Premium Task</span>
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <TasksTable
                    tasks={premiumTasks}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {activeTab === "APPROVALS" && (
              <div className="p-2 sm:p-4">
                <ApprovalsPanel
                  completions={localCompletions}
                  onApprovalComplete={handleApprovalComplete}
                />
              </div>
            )}

            {activeTab === "COMPANIES" && (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200/60 dark:border-slate-700 mb-4 shadow-sm">
                  <BuildingOfficeIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Partner Nodes Ecosystem
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                  B2B corporate company integrations and localized client
                  dashboard permissions pipeline coming soon.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
                  <SparklesIcon className="w-3 h-3" /> Under Development
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Layer Trigger */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            task={editingTask}
            companies={companies}
            defaultType={defaultType}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
