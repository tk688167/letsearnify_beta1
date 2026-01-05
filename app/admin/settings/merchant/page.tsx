import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getMerchantSettings } from "@/app/actions/admin/merchant-settings"
import MerchantSettingsPage from "./settings-view"

export default async function Page() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") redirect("/dashboard")
    
    const countries = await getMerchantSettings()
    
    return <MerchantSettingsPage countries={countries} />
}
