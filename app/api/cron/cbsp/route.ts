import { NextResponse } from "next/server";
import { executeWeeklyCbspDistribution } from "@/lib/cbsp";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await executeWeeklyCbspDistribution();
        
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("CBSP Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
