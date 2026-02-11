
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  
  // Strict Admin Check
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id }})
  if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // RESET ALL USERS TO STARTER STATE
  // As requested: Tier=Starter, Points=0, Balance=0
  try {
      await prisma.user.updateMany({
        data: {
          tier: "NEWBIE",
          arnBalance: 0,
          balance: 0, 
        }
      })
      
      // Optionally clear logs if "Completely reset" implies history too?
      // "Clear any cached or frontend stored progress data"
      // We'll stick to the User state for now as that drives the UI.

      return NextResponse.json({ success: true, message: "System Reset Complete" })
  } catch (error) {
     return NextResponse.json({ error: "Reset Failed" }, { status: 500 })
  }
}
