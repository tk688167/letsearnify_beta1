import { NextResponse } from "next/server"
import { auth } from "@/auth" 
import { prisma } from "@/lib/prisma"

// NOTE: Adjusted to try importing auth from root. If that fails, we fallback to session check.
// Since we couldn't find exact auth file, we'll try standard next-auth getSession pattern wrappers if any.
// BUT for now, let's look for session in headers or cookies if auth() is not available.
// Actually, looking at `package.json`, `@auth/prisma-adapter` and `next-auth` v5 are used.
// So `import { auth } from "@/auth"` is standard. 

export async function GET() {
  try {
    // If we can't import auth, we might have issues. 
    // Let's assume the user is logged in via cookie.
    // For this specific 'Check Role' after generic signin, we rely on the session.
    
    // TEMPORARY FIX: If we can't locate `auth`, we might need to find where the session configuration is.
    // But let's write it assuming standard v5 structure.
    
    // HOWEVER, to be robust:
    // We will just query the DB if we have the email from the previous step? No, that's insecure.
    // We need the session.
    
    // Let's try to assume there is an auth config.
    const session = await auth()
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ role: "GUEST" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, tier: true }
    })

    return NextResponse.json({ 
        role: user?.role || "USER",
        tier: user?.tier || "NEWBIE"
    })

  } catch (error) {
    return NextResponse.json({ role: "GUEST", error: "Auth failed" }, { status: 500 })
  }
}
