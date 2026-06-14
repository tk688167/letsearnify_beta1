import { NextResponse } from "next/server"
import { executeDailyPoolDistribution } from "@/lib/daily-pool"

export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET || "temp_dev_secret_override"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")
        
        if (token !== CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 })
        }

        const result = await executeDailyPoolDistribution();

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
