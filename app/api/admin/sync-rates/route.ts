import { syncAllExchangeRates } from "@/app/actions/admin/merchant-settings"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await auth()
        const authHeader = req.headers.get('authorization')
        
        // Allow if admin or if using a secret key (for cron jobs)
        const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
        const isAdmin = session?.user?.role === "ADMIN"

        if (!isAdmin && !isCron) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await syncAllExchangeRates()
        
        if (result.error) {
            return NextResponse.json(result, { status: 500 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
