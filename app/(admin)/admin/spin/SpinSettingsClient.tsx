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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 max-w-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Global Configuration</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Free Spin Cooldown (Hours)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                            value={settings.freeSpinCooldownHours}
                            onChange={e => setSettings({...settings, freeSpinCooldownHours: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Time between free spins (e.g., 48).</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Premium Spin Cooldown (Hours)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                            value={settings.premiumSpinCooldownHours}
                            onChange={e => setSettings({...settings, premiumSpinCooldownHours: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Time between daily premium spins (e.g., 24).</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Premium Unlock Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 dark:text-slate-500 text-sm">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 pl-7 text-sm outline-none focus:border-indigo-500"
                                value={settings.premiumUnlockAmount}
                                onChange={e => setSettings({...settings, premiumUnlockAmount: parseFloat(e.target.value)})}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Total deposit required to unlock Premium Wheel.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Welcome Bonus Period (Days)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                            value={settings.welcomeBonusDays}
                            onChange={e => setSettings({...settings, welcomeBonusDays: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Number of days new users get better odds.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Surprise Gift Interval (Days)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                            value={settings.surpriseGiftIntervalDays}
                            onChange={e => setSettings({...settings, surpriseGiftIntervalDays: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Minimum days between guaranteed surprise gifts.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                    >
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    )
}
