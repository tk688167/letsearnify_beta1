import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = {
      adminEmail: process.env.ADMIN_EMAIL || '',
      enableEmail: true
    }

    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: "ADMIN_NOTIFICATION_SETTINGS" }
      })
      if (config?.value) {
        settings = { ...settings, ...(config.value as any) }
      }
    } catch {}

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    await prisma.systemConfig.upsert({
      where: { key: "ADMIN_NOTIFICATION_SETTINGS" },
      update: { value: body },
      create: { key: "ADMIN_NOTIFICATION_SETTINGS", value: body }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}