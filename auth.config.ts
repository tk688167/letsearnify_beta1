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
        const ALLOWED_ADMIN = "admin@letsearnify.com";
        // Strict Email Whitelist for Admin Portal
        if (isLoggedIn && auth?.user?.email === ALLOWED_ADMIN) return true
        
        // Redirect unauthorized logged-in users to /unauthorized or home
        if (isLoggedIn) return Response.redirect(new URL('/unauthorized', nextUrl))
        
        return false // Block unauthenticated users
      }
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }

      if (nextUrl.pathname === '/login' && isLoggedIn) {
        return Response.redirect(new URL('/dashboard/welcome', nextUrl))
      }

      return true
    },
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string // Ensure ID is passed
        session.user.role = token.role as any
        session.user.memberId = token.memberId as number
      }
      return session
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
