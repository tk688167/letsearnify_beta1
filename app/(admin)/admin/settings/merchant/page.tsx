export const dynamic = "force-dynamic";

import { redirect } from "next/navigation"

export default function LegacyMerchantSettings() {
    redirect("/admin/merchant")
}
