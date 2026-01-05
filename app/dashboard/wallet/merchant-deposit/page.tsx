import { getMerchantSettings } from "@/app/actions/admin/merchant-settings"
import MerchantDepositClient from "./merchant-view"

export default async function Page() {
    // Fetch dynamic settings from DB
    const countries = await getMerchantSettings()
    
    return <MerchantDepositClient initialCountries={countries} />
}
