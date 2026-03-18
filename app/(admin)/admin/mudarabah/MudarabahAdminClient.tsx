"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  CogIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";

interface MudarabahPool {
  id: string;
  title: string;
  targetAmount: number;
  minDeposit: number;
  maxDeposit: number;
  durationMonths: number;
  isLive: boolean;
  totalDeposited: number;
  status: string;
  _count: { investments: number };
}

export default function MudarabahAdminClient() {
  const [pools, setPools] = useState<MudarabahPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveFeature, setIsLiveFeature] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    minDeposit: "1.0",
    maxDeposit: "",
    durationMonths: "3",
    imageUrl: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/mudarabah");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setPools(data.pools);
      setIsLiveFeature(data.config?.isLive || false);
    } catch (error) {
      toast.error("Error loading pools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFeatureStatus = async () => {
    try {
      const res = await fetch("/api/admin/mudarabah/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: !isLiveFeature }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setIsLiveFeature(!isLiveFeature);
      toast.success(`Feature is now ${!isLiveFeature ? "Live" : "in Dev Mode"}`);
    } catch (error) {
      toast.error("Error toggling feature status");
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/mudarabah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create pool");
      
      toast.success("Pool created successfully");
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        minDeposit: "1.0",
        maxDeposit: "",
        durationMonths: "3",
        imageUrl: "",
      });
      fetchData();
    } catch (error) {
      toast.error("Error creating pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePoolStatus = async (poolId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/mudarabah/${poolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update pool");
      
      setPools(pools.map(p => p.id === poolId ? { ...p, isLive: !currentStatus } : p));
      toast.success("Pool visibility updated");
    } catch (error) {
      toast.error("Error updating pool");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mudarabah Pools</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage investment pools and profit distribution
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Global Feature Toggle */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800/60 shadow-sm">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLiveFeature ? "Feature is Live" : "Dev Mode"}
              </span>
              <button
                onClick={toggleFeatureStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isLiveFeature ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isLiveFeature ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 shadow-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Create Pool
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-800 mt-2">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-500/10">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pools.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-800 mt-2">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-50 p-3 dark:bg-green-500/10">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Funds Deposited</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${pools.reduce((sum, p) => sum + p.totalDeposited, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-800 overflow-hidden"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">{pool.title}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    pool.status === 'OPEN' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    pool.status === 'ACTIVE' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                    'bg-gray-50 text-gray-700 dark:bg-slate-500/10 dark:text-gray-400'
                  }`}>
                    {pool.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Target</p>
                    <p className="font-medium text-gray-900 dark:text-white">${pool.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Deposited</p>
                    <p className="font-medium text-gray-900 dark:text-white">${pool.totalDeposited.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Investors</p>
                    <p className="font-medium text-gray-900 dark:text-white">{pool._count.investments}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{pool.durationMonths} Months</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex text-xs justify-between text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{((pool.totalDeposited / pool.targetAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min((pool.totalDeposited / pool.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 bg-gray-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                  <button
                    onClick={() => togglePoolStatus(pool.id, pool.isLive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      pool.isLive ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        pool.isLive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <Link 
                  href={`/admin/mudarabah/${pool.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <CogIcon className="w-4 h-4" />
                  Manage Pool
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Pool</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePool} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pool Title (e.g., Real Estate Q3)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target Amount ($)
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (Months)
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.durationMonths}
                        onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pool Cover Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {formData.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden h-36 w-full border border-gray-200 dark:border-slate-700 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img
                          src={formData.imageUrl}
                          alt="Pool cover preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</span>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500 text-sm gap-2 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <PhotoIcon className="w-7 h-7" />
                            <span className="font-medium">Click to upload pool image</span>
                            <span className="text-xs">JPG, PNG, WEBP up to 5MB</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min. Deposit ($)
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.minDeposit}
                        onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max. Deposit ($)
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.maxDeposit}
                        onChange={(e) => setFormData({ ...formData, maxDeposit: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end border-t border-gray-100 dark:border-slate-800 pt-5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? "Creating..." : "Create Pool"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
