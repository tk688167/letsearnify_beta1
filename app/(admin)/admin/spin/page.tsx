import { getSpinRewards, getSpinSettings } from "@/app/actions/admin/spin-rewards"
import SpinConfigClient from "./SpinConfigClient"
import SpinSettingsClient from "./SpinSettingsClient"
import TimerControlsClient from "./TimerControlsClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

export default async function AdminSpinPage() {
    const freeRewards = await getSpinRewards("FREE")
    const premiumRewards = await getSpinRewards("PREMIUM")
    const settings = await getSpinSettings()

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">Spin System</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
                        Comprehensive management for your reward wheels. Configure segments, probabilities, and global settings with precision.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="free" className="w-full">
                <TabsList className="inline-flex w-full md:w-auto items-center justify-start bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                    <TabsTrigger value="free" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md text-slate-500 dark:text-slate-400">
                        Free Wheel
                    </TabsTrigger>
                    <TabsTrigger value="premium" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md text-slate-500 dark:text-slate-400">
                        Premium Wheel
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md text-slate-500 dark:text-slate-400">
                        Global Settings
                    </TabsTrigger>
                    <TabsTrigger value="timers" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md text-slate-500 dark:text-slate-400">
                        Timer Controls
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8 transition-all duration-300">
                    <TabsContent value="free" className="focus-visible:outline-none">
                        <SpinConfigClient initialRewards={freeRewards} spinType="FREE" />
                    </TabsContent>
                    <TabsContent value="premium" className="focus-visible:outline-none">
                        <SpinConfigClient initialRewards={premiumRewards} spinType="PREMIUM" />
                    </TabsContent>
                    <TabsContent value="settings" className="focus-visible:outline-none">
                        <SpinSettingsClient initialSettings={settings} />
                    </TabsContent>
                    <TabsContent value="timers" className="focus-visible:outline-none">
                        <TimerControlsClient />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
