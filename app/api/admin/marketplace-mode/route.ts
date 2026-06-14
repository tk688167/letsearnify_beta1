import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMarketplaceMode, setMarketplaceMode } from "@/lib/marketplace-mode"

export const dynamic = "force-dynamic"

export async function GET() {
  const mode = await getMarketplaceMode()
  return NextResponse.json({ mode })
}

export async function POST(req: Request) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { mode } = body

  if (mode !== "development" && mode !== "live") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  await setMarketplaceMode(mode)
  const current = await getMarketplaceMode()

  return NextResponse.json({ mode: current, success: true })
}
