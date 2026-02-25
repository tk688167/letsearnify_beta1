"use client"

import { User } from "@prisma/client"
import EditForm from "../profile/edit/edit-form"

// We've removed the tabs and sidebar entirely based on user feedback.
// The Settings page is now a unified single-page scrollable view focused on MLM practical needs.
export default function SettingsTabs({ user }: { user: User | null }) {
  return (
    <div className="pb-12 w-full">
      <EditForm user={user} />
    </div>
  )
}
