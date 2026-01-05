import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditForm from "./edit-form"

export default async function EditProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <EditForm user={user} />
    </div>
  )
}
