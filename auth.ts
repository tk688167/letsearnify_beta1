import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { generateReferralCode } from "@/lib/mlm"
import { ADMIN_CREDENTIALS, ADMIN_USER_OBJECT } from "@/lib/admin-credentials"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { 
    strategy: "jwt",
    maxAge: 48 * 60 * 60,
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("🔍 AUTH ATTEMPT:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = (credentials.password as string).trim()

        // Admin bypass
        if (
          email === ADMIN_CREDENTIALS.email.toLowerCase() &&
          password === ADMIN_CREDENTIALS.password
        ) {
          console.log("🔐 ADMIN BYPASS LOGIN:", ADMIN_CREDENTIALS.email)
          return { ...ADMIN_USER_OBJECT } as any
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.password) {
            console.log("❌ User not found or no password:", email)
            return null
          }

          if (!user.emailVerified) {
            console.log("❌ Login blocked: Email not verified for", email)
            throw new Error("EMAIL_NOT_VERIFIED")
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            console.log("✅ Login Successful for:", user.email)
            return user
          }

          console.log("❌ Login Failed: Password mismatch for", email)
          return null
        } catch (dbError: any) {
          if (dbError.message === "EMAIL_NOT_VERIFIED") {
            throw dbError
          }
          console.error("💾 Database Connection Error during auth:", dbError.message)
          throw new Error("DATABASE_UNAVAILABLE")
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      // Force consent screen to ensure we always get a proper token
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
        id: "impersonation",
        name: "Impersonation",
        credentials: {
            token: { label: "Token", type: "text" }
        },
        async authorize(credentials) {
            if (!credentials?.token) return null
            
            try {
                const jwt = await import("jsonwebtoken")
                const secret = process.env.AUTH_SECRET
                if (!secret) throw new Error("Missing AUTH_SECRET")

                const payload = jwt.verify(credentials.token as string, secret) as any

                if (payload.type !== "impersonation" || !payload.targetUserId) {
                    throw new Error("Invalid token type")
                }

                const user = await prisma.user.findUnique({
                    where: { id: payload.targetUserId }
                })

                if (!user) return null

                console.log("🎭 Admin Impersonation: Switching to", user.email)
                return user

            } catch (error) {
                console.error("Impersonation failed:", error)
                return null
            }
        }
    })
  ],
  events: {
    async createUser({ user }) {
        try {
            console.log("✨ Google Signup: Processing new user", user.email)
            
            let validReferredByCode = 'COMPANY'
            
            // Try to read referral code from cookie
            try {
                const { cookies } = await import("next/headers")
                const cookieStore = await cookies()
                const referralCodeInput = cookieStore.get("referral_code")?.value

                if (referralCodeInput) {
                    const referrer = await prisma.user.findUnique({ 
                        where: { referralCode: referralCodeInput } 
                    })
                    if (referrer) {
                        validReferredByCode = referralCodeInput
                    }
                }
            } catch (cookieError) {
                console.warn("⚠️ Could not read referral cookie (expected in some flows):", cookieError)
            }

            const newReferralCode = generateReferralCode()

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    referralCode: newReferralCode,
                    referredByCode: validReferredByCode,
                    tier: "NEWBIE" as any,
                    tierStatus: "CURRENT" as any,
                    arnBalance: 0,
                    activeMembers: 0,
                    totalDeposit: 0.0,
                    isActiveMember: false,
                    role: "USER"
                }
            })

            let advisorId = null
            let supervisorId = null
            let managerId = null
            
            const actualReferrer = await prisma.user.findUnique({
                where: { referralCode: validReferredByCode }
            })

            if (actualReferrer) {
                advisorId = actualReferrer.id
                
                const referrerTree = await prisma.referralTree.findUnique({
                    where: { userId: actualReferrer.id }
                })

                if (referrerTree) {
                    supervisorId = referrerTree.advisorId
                    managerId = referrerTree.supervisorId
                }
            }

            await prisma.referralTree.create({
                data: {
                    userId: user.id!,
                    advisorId,
                    supervisorId,
                    managerId
                }
            })
            
            console.log("✅ Google Signup: MLM Setup Complete for", user.email)

        } catch (error) {
            console.error("❌ Google Signup Error:", error)
            // Don't throw — let the user still sign in even if MLM setup fails
            // They can be fixed later via admin
        }
    }
  },
  callbacks: {
    // ── NEW: signIn callback to handle Google OAuth edge cases ──
    async signIn({ user, account, profile }) {
      // Always allow credentials & impersonation
      if (account?.provider === "credentials" || account?.provider === "impersonation") {
        return true
      }

      // For Google sign-in
      if (account?.provider === "google") {
        try {
          // Check if the email from Google is valid
          if (!profile?.email) {
            console.error("❌ Google sign-in: No email in profile")
            return false
          }

          // Check if user exists with this email but signed up via credentials (no emailVerified)
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email.toLowerCase() }
          })

          if (existingUser && !existingUser.emailVerified) {
            // Auto-verify email since Google already verified it
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() }
            })
            console.log("✅ Auto-verified email for existing user via Google:", profile.email)
          }

          return true
        } catch (error) {
          console.error("❌ Google signIn callback error:", error)
          // Still allow sign-in even if our check fails
          return true
        }
      }

      return true
    },

    authorized: authConfig.callbacks.authorized,

    async jwt({ token, user, account, trigger }) {
      // On initial sign-in (user object is available)
      if (user) {
        token.role = (user as any).role || "USER"
        token.id = user.id
        token.isActiveMember = (user as any).isActiveMember || false
        token.memberId = (user as any).memberId || ""
        
        if (user.id === "super-admin-id") {
            token.isActiveMember = true
            token.memberId = "777777"
        }

        // For Google sign-in, fetch the latest user data from DB
        // because the user object from adapter might not have our custom fields yet
        if (account?.provider === "google" && user.id && user.id !== "super-admin-id") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id }
            })
            if (dbUser) {
              token.role = dbUser.role
              token.memberId = dbUser.memberId
              token.isActiveMember = dbUser.isActiveMember
            }
          } catch (error) {
            console.error("Error fetching Google user data in JWT:", error)
          }
        }

        return token
      }
      
      if (!token.sub) return token

      if (token.sub === "super-admin-id") {
          return token
      }
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub }
        })
        
        if (existingUser) {
          token.role = existingUser.role
          token.memberId = existingUser.memberId
          token.isActiveMember = existingUser.isActiveMember
        }
      } catch (error) {
        console.error("Error fetching user in JWT callback:", error)
      }
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
  }
})