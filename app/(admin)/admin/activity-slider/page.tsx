"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { TrashIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

type SliderMessage = {
    text: string
    active: boolean
    icon?: string
}

export default function ActivitySliderManager() {
    const [messages, setMessages] = useState<SliderMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/admin/activity-slider")
            .then(res => res.json())
            .then(data => {
                if (!data.error) setMessages(data)
            })
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleAdd = () => {
        setMessages([...messages, { text: "New Activity Message", active: true, icon: "🔔" }])
    }

    const handleDelete = (index: number) => {
        const newMsgs = [...messages]
        newMsgs.splice(index, 1)
        setMessages(newMsgs)
    }

    const handleChange = (index: number, field: keyof SliderMessage, value: any) => {
        const newMsgs = [...messages]
        // @ts-ignore
        newMsgs[index][field] = value
        setMessages(newMsgs)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/admin/activity-slider", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messages)
            })
            if (res.ok) alert("Saved successfully!")
            else alert("Failed to save")
        } catch (error) {
            console.error(error)
            alert("Error saving")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-10">Loading...</div>

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h1 className="text-3xl font-serif font-bold text-gray-900">Activity Slider</h1>
                     <p className="text-gray-500 mt-1">Manage the live ticker messages shown on the site.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                >
                    {saving && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 items-start md:items-center">
                            
                            {/* Icon Input */}
                            <div className="w-full md:w-20">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Icon</label>
                                <input 
                                    type="text" 
                                    value={msg.icon || "🔔"}
                                    onChange={(e: any) => handleChange(idx, "icon", e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center"
                                />
                            </div>

                            {/* Text Input */}
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Message</label>
                                <input 
                                    type="text" 
                                    value={msg.text}
                                    onChange={(e: any) => handleChange(idx, "text", e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                             {/* Active Toggle */}
                             <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <label className="flex items-center cursor-pointer gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={msg.active}
                                        onChange={(e: any) => handleChange(idx, "active", e.target.checked)}
                                        className="form-checkbox w-5 h-5 text-blue-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                             </div>

                             {/* Delete */}
                             <button 
                                onClick={() => handleDelete(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2 md:mt-0"
                             >
                                <TrashIcon className="w-5 h-5" />
                             </button>

                        </div>
                    ))}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={handleAdd}
                        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-6 h-6" />
                        Add New Message
                    </button>
                </div>
            </div>
        </div>
    )
}
