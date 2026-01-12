import React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FeatureGuard } from "../components/FeatureGuard"
import crypto from "crypto"
import TaskPageClient from "./components/TaskPageClient"

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const session = await auth()
  
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true }
  })

  if (!user) return null

  // PRODUCTION-READY: Strict Type Definition
  interface PlatformTask {
    id: string
    title: string
    description: string
    reward: number
    type: string
    status: string
    link?: string | null
    createdAt: Date
    company?: {
      name: string
      logoUrl: string | null
      status: string
    } | null
  }

  // Fetch Platform Tasks (Active only) w/ Proper Typing
  // NOTE: Casting via unknown because Prisma Client types might be stale until restart
  const platformTasksRaw = (await prisma.task.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { company: true }
  })) as unknown as PlatformTask[]

  // Filter out tasks from Inactive Companies
  const platformTasks = platformTasksRaw.filter(t => !t.company || t.company.status === "ACTIVE")

  // ------------------------------------------------------------------
  // CONFIGURATION: CPX RESEARCH
  // ------------------------------------------------------------------
  const APP_ID = "30895"
  
  // [IMPORTANT] REPLACE THIS WITH YOUR ACTUAL SECRET KEY FROM CFX/CPX DASHBOARD
  const SECRET_KEY = "YOUR_CFX_SECRET_KEY" 
  
  // Generate Secure Hash
  // Formula: md5(ext_user_id + "-" + secret_key) per provided snippet
  const ext_user_id = user.id
  const secure_hash = crypto
    .createHash('md5')
    .update(`${ext_user_id}-${SECRET_KEY}`)
    .digest("hex")

  // Construct URL
  const searchParams = new URLSearchParams({
    app_id: APP_ID,
    ext_user_id: ext_user_id,
    secure_hash: secure_hash,
    username: user.name || "User",
    email: user.email || "",
    subid_1: user.id, 
    subid_2: "" // per snippet
  })

  // URL from snippet: offers.cpx-research.com
  const cfxUrl = `https://offers.cpx-research.com/index.php?${searchParams.toString()}`

  return (
    <FeatureGuard title="Task Center" feature="tasks">
       <TaskPageClient 
          user={user} 
          platformTasks={platformTasks} 
          cfxUrl={cfxUrl} 
       />
    </FeatureGuard>
  )
}
