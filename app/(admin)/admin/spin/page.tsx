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
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Spin Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure rewards, probabilities, and global settings for the Spin System.</p>
            </div>

            <Tabs defaultValue="free" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-auto bg-gray-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <TabsTrigger value="free" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Free Wheel</TabsTrigger>
                    <TabsTrigger value="premium" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Premium Wheel</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Global Settings</TabsTrigger>
                    <TabsTrigger value="timers" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Timer Controls</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="free">
                        <SpinConfigClient initialRewards={freeRewards} spinType="FREE" />
                    </TabsContent>
                    <TabsContent value="premium">
                        <SpinConfigClient initialRewards={premiumRewards} spinType="PREMIUM" />
                    </TabsContent>
                    <TabsContent value="settings">
                        <SpinSettingsClient initialSettings={settings} />
                    </TabsContent>
                    <TabsContent value="timers">
                        <TimerControlsClient />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
