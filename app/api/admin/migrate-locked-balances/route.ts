import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        console.log("🚀 Starting Locked Balance Migration via API...");
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { lockedBalance: { gt: 0 } },
                    { lockedArnBalance: { gt: 0 } }
                ]
            }
        });

        console.log(`🔍 Found ${users.length} users with locked funds.`);

        for (const user of users) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              balance: { increment: user.lockedBalance || 0 },
              arnBalance: { increment: user.lockedArnBalance || 0 },
              lockedBalance: 0,
              lockedArnBalance: 0
            }
          });
        }

        return NextResponse.json({ success: true, migrated: users.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
