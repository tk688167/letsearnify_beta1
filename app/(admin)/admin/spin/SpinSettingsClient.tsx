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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Global Configuration</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Spin Cooldown (Hours)</label>
                        <input 
                            type="number" 
                            className="w-full border rounded-lg p-2"
                            value={settings.freeSpinCooldownHours}
                            onChange={e => setSettings({...settings, freeSpinCooldownHours: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Time between free spins (e.g., 48).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Premium Spin Cooldown (Hours)</label>
                        <input 
                            type="number" 
                            className="w-full border rounded-lg p-2"
                            value={settings.premiumSpinCooldownHours}
                            onChange={e => setSettings({...settings, premiumSpinCooldownHours: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Time between daily premium spins (e.g., 24).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Premium Unlock Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full border rounded-lg p-2 pl-7"
                                value={settings.premiumUnlockAmount}
                                onChange={e => setSettings({...settings, premiumUnlockAmount: parseFloat(e.target.value)})}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total deposit required to unlock Premium Wheel.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus Period (Days)</label>
                        <input 
                            type="number" 
                            className="w-full border rounded-lg p-2"
                            value={settings.welcomeBonusDays}
                            onChange={e => setSettings({...settings, welcomeBonusDays: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Number of days new users get better odds.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Surprise Gift Interval (Days)</label>
                        <input 
                            type="number" 
                            className="w-full border rounded-lg p-2"
                            value={settings.surpriseGiftIntervalDays}
                            onChange={e => setSettings({...settings, surpriseGiftIntervalDays: parseFloat(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum days between guaranteed surprise gifts.</p>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    )
}
