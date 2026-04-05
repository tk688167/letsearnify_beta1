import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
    // Add error page to prevent redirect loops
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")

      // ── Always allow auth-related routes (critical for Google OAuth) ──
      if (nextUrl.pathname.startsWith("/api/auth")) return true
      if (nextUrl.pathname.startsWith("/verify-email")) return true

      // ── Admin routes ──
      if (isOnAdmin) {
        if (isLoggedIn && (auth?.user as any)?.role === "ADMIN") return true
        if (isLoggedIn) return Response.redirect(new URL('/unauthorized', nextUrl))
        return false
      }
      
      // ── Dashboard routes ──
      if (isOnDashboard) {
        if (!isLoggedIn) return false
        if (isRouteRestricted(nextUrl.pathname)) {
            const user = auth!.user as any
            if (!user?.isActiveMember) {
                return Response.redirect(new URL('/dashboard?error=deposit_required', nextUrl))
            }
        }
        return true
      }

      // ── Redirect logged-in users away from login/signup ──
      if ((nextUrl.pathname === '/login' || nextUrl.pathname === '/signup') && isLoggedIn) {
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
    return restricted.some((r: any) => path.startsWith(r))
}
