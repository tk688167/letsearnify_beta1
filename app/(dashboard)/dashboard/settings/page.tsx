export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SettingsTabs from "./settings-tabs"
import { Cog8ToothIcon } from "@heroicons/react/24/solid"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  let user;
  
  try {
      if (session.user.id === "super-admin-id") {
          user = {
              id: "super-admin-id",
              name: "Super Admin",
              email: "admin@letsearnify.com",
              paymentMethods: []
          } as any;
      } else {
          user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
               paymentMethods: true
            }
          })
      }
  } catch (error) {
      console.error("⚠️ Settings Page Offline Mode:", error);
      user = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          paymentMethods: []
      } as any;
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-4">
          <Cog8ToothIcon className="w-4 h-4" />
          Settings & Preferences
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-2 text-base max-w-2xl font-light">Manage your profile, preferences, and account security.</p>
      </header>
      
      <SettingsTabs user={user} />
    </div>
  )
}
