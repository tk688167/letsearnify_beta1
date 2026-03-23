import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { generateReferralCode } from "@/lib/mlm"
import { ADMIN_CREDENTIALS, ADMIN_USER_OBJECT } from "@/lib/admin-credentials"

// ─────────────────────────────────────────────────────────────
// HOW NextAuth handleLoginOrRegister WORKS (from source):
//
// 1. getUserByAccount({ provider, providerAccountId })
//    → If found: sign in as that user (DONE, no linking needed)
//    → If NOT found: continue to step 2
//
// 2. getUserByEmail(profile.email)
//    → If found AND allowDangerousEmailAccountLinking=true:
//      set user = userByEmail, then call linkAccount()
//    → If found AND linking NOT allowed: throw OAuthAccountNotLinked
//    → If NOT found: call createUser(), then linkAccount()
//
// PROBLEM: When createUser returns an EXISTING user (our override),
// NextAuth still calls linkAccount which creates the Account record.
// This is fine for first login. On second login, getUserByAccount
// finds the record and signs in directly. WORKS.
//
// The bug was: the signIn callback was ALSO trying to create
// Account records, causing P2002 unique constraint violations,
// and returning true despite the error — but NextAuth's internal
// handleLoginOrRegister still threw OAuthAccountNotLinked.
// ─────────────────────────────────────────────────────────────

function CustomPrismaAdapter(p: typeof prisma) {
  const baseAdapter = PrismaAdapter(p) as any

  return {
    ...baseAdapter,

    // When Google user already exists (signed up via credentials),
    // return that user instead of creating a duplicate.
    // NextAuth will then call linkAccount() to create the Account record.
    async createUser(data: any) {
      const email = data.email?.toLowerCase()

      if (email) {
        const existingUser = await p.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          // Update with Google profile info (image, emailVerified)
          const updated = await p.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: data.emailVerified || new Date(),
              image: data.image || existingUser.image,
              name: existingUser.name || data.name,
            },
          })
          console.log("✅ [Adapter] Returning existing user for Google sign-in:", email)
          return updated
        }
      }

      // Truly new user — create normally
      const newUser = await baseAdapter.createUser(data)
      console.log("✨ [Adapter] Created new user:", newUser.email)
      return newUser
    },

    // Handle duplicate linking gracefully — prevent P2002 crashes
    async linkAccount(account: any) {
      try {
        // Check if already linked
        const existing = await p.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        })

        if (existing) {
          // Update tokens (they change each login)
          await p.account.update({
            where: { id: existing.id },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token ?? existing.refresh_token,
              expires_at: account.expires_at,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          })
          console.log("🔗 [Adapter] Updated existing account link:", account.provider)
          return existing
        }

        // Create new link
        const result = await p.account.create({
          data: {
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        })
        console.log("🔗 [Adapter] Linked", account.provider, "to userId:", account.userId)
        return result
      } catch (error: any) {
        if (error?.code === "P2002") {
          console.log("🔗 [Adapter] Account already linked (race condition), ignoring")
          return
        }
        throw error
      }
    },
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: CustomPrismaAdapter(prisma) as any,
  session: { 
    strategy: "jwt",
    maxAge: 48 * 60 * 60,
  },
  trustHost: true,
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

        if (
          email === ADMIN_CREDENTIALS.email.toLowerCase() &&
          password === ADMIN_CREDENTIALS.password
        ) {
          console.log("🔐 ADMIN BYPASS LOGIN:", ADMIN_CREDENTIALS.email)
          return { ...ADMIN_USER_OBJECT } as any
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } })

          if (!user || !user.password) {
            console.log("❌ User not found or no password:", email)
            return null
          }

          if (!user.emailVerified) {
            console.log("❌ Email not verified for", email)
            throw new Error("EMAIL_NOT_VERIFIED")
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            console.log("✅ Login Successful for:", user.email)
            return user
          }

          console.log("❌ Password mismatch for", email)
          return null
        } catch (dbError: any) {
          if (dbError.message === "EMAIL_NOT_VERIFIED") throw dbError
          console.error("💾 Database error:", dbError.message)
          throw new Error("DATABASE_UNAVAILABLE")
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
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
        credentials: { token: { label: "Token", type: "text" } },
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
                const user = await prisma.user.findUnique({ where: { id: payload.targetUserId } })
                if (!user) return null
                console.log("🎭 Impersonation:", user.email)
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
            console.log("✨ Google Signup event: Processing", user.email)
            
            let validReferredByCode = 'COMPANY'
            
            try {
                const { cookies } = await import("next/headers")
                const cookieStore = await cookies()
                const referralCodeInput = cookieStore.get("referral_code")?.value
                if (referralCodeInput) {
                    const referrer = await prisma.user.findUnique({ 
                        where: { referralCode: referralCodeInput } 
                    })
                    if (referrer) validReferredByCode = referralCodeInput
                }
            } catch (cookieError) {
                console.warn("⚠️ Could not read referral cookie:", cookieError)
            }

            const newReferralCode = generateReferralCode()

            // Only update if this user doesn't already have a referral code
            // (prevents overwriting data for existing credential users)
            const currentUser = await prisma.user.findUnique({ where: { id: user.id! } })
            
            if (!currentUser?.referralCode) {
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

                // Only create tree if it doesn't exist
                const existingTree = await prisma.referralTree.findUnique({
                    where: { userId: user.id! }
                })
                
                if (!existingTree) {
                    await prisma.referralTree.create({
                        data: { userId: user.id!, advisorId, supervisorId, managerId }
                    })
                }
                
                console.log("✅ Google Signup: MLM Setup Complete for", user.email)
            } else {
                console.log("ℹ️ User already has referral code, skipping MLM setup:", user.email)
            }

        } catch (error) {
            console.error("❌ Google Signup Error:", error)
        }
    }
  },
  callbacks: {
    // ── signIn: ONLY verify email, do NOT touch accounts table ──
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials" || account?.provider === "impersonation") {
        return true
      }

      if (account?.provider === "google" && profile?.email) {
        try {
          const email = profile.email.toLowerCase()
          const existingUser = await prisma.user.findUnique({ where: { email } })

          if (existingUser && !existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() }
            })
            console.log("✅ Auto-verified email via Google:", email)
          }
        } catch (error) {
          console.error("❌ Google signIn callback error:", error)
        }
      }

      return true
    },

    authorized: authConfig.callbacks.authorized,

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || "USER"
        token.id = user.id
        token.isActiveMember = (user as any).isActiveMember || false
        token.memberId = (user as any).memberId || ""
        
        if (user.id === "super-admin-id") {
            token.isActiveMember = true
            token.memberId = "777777"
        }

        // For Google, fetch fresh data since adapter user may lack custom fields
        if (account?.provider === "google" && user.id && user.id !== "super-admin-id") {
          try {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
            if (dbUser) {
              token.role = dbUser.role
              token.memberId = dbUser.memberId
              token.isActiveMember = dbUser.isActiveMember
            }
          } catch (error) {
            console.error("JWT Google user fetch error:", error)
          }
        }

        return token
      }
      
      if (!token.sub) return token
      if (token.sub === "super-admin-id") return token
      
      try {
        const existingUser = await prisma.user.findUnique({ where: { id: token.sub } })
        if (existingUser) {
          token.role = existingUser.role
          token.memberId = existingUser.memberId
          token.isActiveMember = existingUser.isActiveMember
        }
      } catch (error) {
        console.error("JWT refresh error:", error)
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