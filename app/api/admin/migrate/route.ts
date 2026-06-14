import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// One-shot migration endpoint: Adds lockedArnBalance column to User table
// IMPORTANT: Delete this file after running it successfully.
export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Run a raw SQL query to add the column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "lockedArnBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
    `)

    return NextResponse.json({ success: true, message: "Column 'lockedArnBalance' added (or already exists)." })
  } catch (error: any) {
    console.error("[MIGRATE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Migration failed" }, { status: 500 })
  }
}
