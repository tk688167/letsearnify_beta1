"use client"

import { useState, useTransition, useEffect } from "react"
import { getComingSoonConfig, updateComingSoonConfig, type ComingSoonConfig, type SectionConfig } from "@/app/actions/admin/settings"
import { useRouter } from "next/navigation"
import { RocketLaunchIcon, LockClosedIcon, ClockIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export default function ComingSoonSettingsPage() {
    const [globalConfig, setGlobalConfig] = useState<ComingSoonConfig | null>(null)
    const [activeTab, setActiveTab] = useState<'default' | 'tasks' | 'pools' | 'marketplace'>('default')
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
    const router = useRouter()

    useEffect(() => {
        getComingSoonConfig().then(setGlobalConfig)
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!globalConfig) return

        startTransition(async () => {
            try {
                await updateComingSoonConfig(globalConfig)
                setMessage({ type: "success", text: "Settings saved successfully!" })
                router.refresh()
            } catch (err) {
                setMessage({ type: "error", text: "Failed to save settings." })
            }
        })
    }

    // Helper to update specific section with strict type safety
    const updateSection = <K extends keyof SectionConfig>(key: K, value: SectionConfig[K]) => {
        if (!globalConfig) return
        setGlobalConfig({
            ...globalConfig,
            [activeTab]: {
                ...globalConfig[activeTab],
                [key]: value
            }
        })
    }

    if (!globalConfig) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

    const currentConfig = globalConfig[activeTab]

    const icons = [
        { id: "rocket", label: "Rocket", icon: RocketLaunchIcon },
        { id: "lock", label: "Lock", icon: LockClosedIcon },
        { id: "clock", label: "Clock", icon: ClockIcon },
        { id: "construction", label: "Construction", icon: WrenchScrewdriverIcon },
    ]

    const gradients = [
        { label: "LetsEarnify Blue", from: "from-blue-900", to: "to-indigo-900" },
        { label: "Deep Purple", from: "from-indigo-900", to: "to-purple-900" },
        { label: "Royal Violet", from: "from-violet-900", to: "to-fuchsia-900" },
        { label: "Dark Matter", from: "from-[#121212]", to: "to-[#1E1E2F]" },
        { label: "Ocean Depths", from: "from-sky-950", to: "to-blue-900" },
        { label: "Night Shade", from: "from-slate-900", to: "to-slate-950" },
    ]

    const CurrentIcon = icons.find(i => i.id === (currentConfig.iconType || "rocket"))?.icon || RocketLaunchIcon

    const tabs = [
        { id: 'default', label: 'Default' },
        { id: 'tasks', label: 'Task Center' },
        { id: 'pools', label: 'Mudaraba Pool' },
        { id: 'marketplace', label: 'Marketplace' },
    ] as const

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coming Soon Settings</h1>
                    <p className="text-gray-500 mt-1">Customize "In Development" pages per section.</p>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors",
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 p-6 space-y-8">
                
                {/* General Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between">
                        <span>Content for: <span className="text-blue-600">{tabs.find(t => t.id === activeTab)?.label}</span></span>
                    </h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                        <input 
                            type="text" 
                            value={currentConfig.title}
                            onChange={e => updateSection('title', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            placeholder="e.g. Coming Soon"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Watermark</label>
                        <input 
                            type="text" 
                            value={currentConfig.watermarkText || ""}
                            onChange={e => updateSection('watermarkText', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow uppercase"
                            placeholder="e.g. TASKS"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description Message</label>
                        <textarea 
                            value={currentConfig.description}
                            onChange={e => updateSection('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            placeholder="Write a motivating message..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="showIcon"
                            checked={currentConfig.showIcon}
                            onChange={e => updateSection('showIcon', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <label htmlFor="showIcon" className="text-sm text-gray-700 font-medium select-none">Show Icon</label>
                    </div>

                    {currentConfig.showIcon && (
                         <div className="space-y-2 pt-2">
                            <label className="block text-sm font-medium text-gray-700">Select Icon</label>
                            <div className="flex gap-4">
                                {icons.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => updateSection('iconType', item.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                            currentConfig.iconType === item.id 
                                                ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500" 
                                                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        <item.icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                         </div>
                    )}
                </div>

                {/* Styling */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">Visual Theme</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {gradients.map((g) => (
                            <button
                                key={g.label}
                                type="button"
                                onClick={() => {
                                    updateSection('gradientFrom', g.from)
                                    updateSection('gradientTo', g.to)
                                }}
                                className={cn(
                                    "text-left p-3 rounded-xl border transition-all relative overflow-hidden group",
                                    currentConfig.gradientFrom === g.from && currentConfig.gradientTo === g.to
                                        ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className={cn("h-12 w-full rounded-lg bg-gradient-to-br mb-2", g.from, g.to)}></div>
                                <span className="text-xs font-bold text-gray-700">{g.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Live Preview */}
                    <div className="mt-8 p-6 border border-gray-100 rounded-3xl bg-gray-50 relative">
                        <label className="absolute -top-3 left-4 px-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">Preview: {tabs.find(t => t.id === activeTab)?.label}</label>
                        
                        {/* Mock Preview Card (Using Dark Theme logic) */}
                        <div className={cn("max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl relative p-8 text-center border border-white/5", currentConfig.gradientFrom, currentConfig.gradientTo)}>
                             {/* Backgrounds */}
                             <div className="absolute inset-0 bg-black/20"></div>
                             
                             <div className="relative z-10">
                                 {currentConfig.showIcon && (
                                    <div className="mb-4 inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                        <CurrentIcon className="w-8 h-8 text-white" />
                                    </div>
                                 )}
                                 <h4 className="font-bold text-white text-2xl mb-2">{currentConfig.title}</h4>
                                 <p className="text-gray-300 text-sm">{currentConfig.description}</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}
