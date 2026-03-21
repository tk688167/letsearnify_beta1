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

      if (nextUrl.pathname.startsWith("/verify-email")) return true

      if (isOnAdmin) {
        if (isLoggedIn && (auth?.user as any)?.role === "ADMIN") return true
        if (isLoggedIn) return Response.redirect(new URL('/unauthorized', nextUrl))
        return false
      }
      
      if (isOnDashboard) {
        if (!isLoggedIn) return false
        if (isRouteRestricted(nextUrl.pathname)) {
            const user = auth.user as any
            if (!user?.isActiveMember) {
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
  },
  providers: [],
} satisfies NextAuthConfig

function isRouteRestricted(path: string) {
    const restricted = ['/dashboard/tasks', '/dashboard/marketplace', '/dashboard/wallet/withdraw']
    return restricted.some(r => path.startsWith(r))
}