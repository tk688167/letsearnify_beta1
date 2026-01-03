import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SettingsTabs from "./settings-tabs"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
       paymentMethods: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p- md:p-12 max-w-6xl mx-auto">
      <header className="mb-10 px-6 md:px-0">
        <h1 className="text-4xl font-serif font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-2 text-lg">Manage your profile, security, and preferences.</p>
      </header>
      
      <SettingsTabs user={user} />
    </div>
  )
}
