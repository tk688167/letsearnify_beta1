"use client"

import { useState } from "react"
import { SpinSettings, updateSpinSettings } from "@/app/actions/admin/spin-rewards"
import { useRouter } from "next/navigation"

export default function SpinSettingsClient({ initialSettings }: { initialSettings: SpinSettings }) {
    const [settings, setSettings] = useState<SpinSettings>(initialSettings)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateSpinSettings(settings)
            alert("Settings updated successfully!")
            router.refresh()
        } catch (e) {
            alert("Failed to update settings")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-8 max-w-4xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Global Configuration</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Define system-wide rules and defaults for the Spin rewards platform.</p>
                </div>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Free Spin Cooldown</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                value={isNaN(settings.freeSpinCooldownHours) ? "" : settings.freeSpinCooldownHours}
                                onChange={e => setSettings({...settings, freeSpinCooldownHours: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                            />
                            <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400 uppercase">Hours</span>
                        </div>
                        <p className="text-[11px] text-slate-500/80 leading-relaxed px-1">Waiting period required between individual free spins.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Premium Spin Cooldown</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                value={isNaN(settings.premiumSpinCooldownHours) ? "" : settings.premiumSpinCooldownHours}
                                onChange={e => setSettings({...settings, premiumSpinCooldownHours: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                            />
                            <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400 uppercase">Hours</span>
                        </div>
                        <p className="text-[11px] text-slate-500/80 leading-relaxed px-1">Cooldown duration for the premium wheel access.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Premium Unlock Threshold</label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-slate-400 font-mono text-sm">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 pl-9 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                value={isNaN(settings.premiumUnlockAmount) ? "" : settings.premiumUnlockAmount}
                                onChange={e => setSettings({...settings, premiumUnlockAmount: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500/80 leading-relaxed px-1">Minimum total deposit required for users to unlock the Premium Wheel.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Welcome Bonus Window</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                value={isNaN(settings.welcomeBonusDays) ? "" : settings.welcomeBonusDays}
                                onChange={e => setSettings({...settings, welcomeBonusDays: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                            />
                            <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400 uppercase">Days</span>
                        </div>
                        <p className="text-[11px] text-slate-500/80 leading-relaxed px-1">First few days after signup where users receive boosted win odds.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Guaranteed Surprise Interval</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                value={isNaN(settings.surpriseGiftIntervalDays) ? "" : settings.surpriseGiftIntervalDays}
                                onChange={e => setSettings({...settings, surpriseGiftIntervalDays: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                            />
                            <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400 uppercase">Days</span>
                        </div>
                        <p className="text-[11px] text-slate-500/80 leading-relaxed px-1">Maximum time between guaranteed surprise drops for active users.</p>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-[1.5rem] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSaving && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSaving ? "Synchronizing..." : "Apply Configuration"}
                    </button>
                </div>
            </div>
        </div>
    )
}
