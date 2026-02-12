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
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Spin Management</h1>
                <p className="text-gray-500">Configure rewards, probabilities, and global settings for the Spin System.</p>
            </div>

            <div className="max-w-5xl">
                <Tabs defaultValue="free" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-2/3 bg-gray-100 p-1 rounded-xl">
                        <TabsTrigger value="free" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Free Wheel</TabsTrigger>
                        <TabsTrigger value="premium" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Premium Wheel</TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Global Settings</TabsTrigger>
                        <TabsTrigger value="timers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Timer Controls</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-8">
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
        </div>
    )
}
