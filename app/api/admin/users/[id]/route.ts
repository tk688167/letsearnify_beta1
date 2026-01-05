import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise in newer Next.js versions
) {
  try {
    const session = await auth()
    
    // 1. Auth Check: Must be Admin
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Resolve parameters
    const { id } = await params

    if (!id) {
       return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // 3. Prevent deleting yourself
    if (id === session.user.id) {
        return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 403 })
    }

    // 4. Delete the User (Cascade handles relation cleanups)
    await prisma.user.delete({
      where: { id },
    })

    // 5. Optional: Create an Admin Log? (Using system admin ID or similar if required, but user wanted deletion)
    // Since we can't link to the deleted user, we might just skip or log to a general log if available
    
    // We can verify user is gone:
    // Email is now free.

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
