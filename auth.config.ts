import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")

      if (isOnAdmin) {
        if (isLoggedIn && (auth?.user as any)?.role === "ADMIN") return true
        
        // Redirect unauthorized logged-in users to /unauthorized or home
        if (isLoggedIn) return Response.redirect(new URL('/unauthorized', nextUrl))
        
        return false // Block unauthenticated users
      }
      
      if (isOnDashboard) {
        if (!isLoggedIn) return false
        
        // Anti-Gravity Enforcement: Block Inactive Users from Earning Features
        // We need to check the session user's status. 
        // Note: auth.user is the session user here.
        if (isRouteRestricted(nextUrl.pathname)) {
            const user = auth.user as any;
            // Strict Check: isActiveMember must be true
            if (!user?.isActiveMember) {
                // Redirect to dashboard (FeatureGuard will show "Deposit Required")
                return Response.redirect(new URL('/dashboard?error=deposit_required', nextUrl))
            }
        }
        return true
      }

      if (nextUrl.pathname === '/login' && isLoggedIn) {
        if ((auth?.user as any)?.role === 'ADMIN') {
            return Response.redirect(new URL('/admin', nextUrl))
        }
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.memberId = token.memberId as string
        // @ts-ignore
        session.user.isActiveMember = token.isActiveMember as boolean
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig

// Anti-Gravity: Route Guard Helper
function isRouteRestricted(path: string) {
    const restricted = ['/dashboard/tasks', '/dashboard/marketplace', '/dashboard/wallet/withdraw'];
    return restricted.some(r => path.startsWith(r));
}
