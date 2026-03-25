import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { generateReferralCode, generateMemberId } from "@/lib/mlm"
import { ADMIN_CREDENTIALS, ADMIN_USER_OBJECT } from "@/lib/admin-credentials"

function CustomPrismaAdapter(p: typeof prisma) {
  const baseAdapter = PrismaAdapter(p) as any
  return {
    ...baseAdapter,
    async createUser(data: any) {
      const email = data.email?.toLowerCase()
      if (email) {
        const existingUser = await p.user.findUnique({ where: { email } })
        if (existingUser) {
          return await p.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: data.emailVerified || new Date(),
              image: data.image || existingUser.image,
              name: existingUser.name || data.name,
            },
          })
        }
      }
      return await baseAdapter.createUser(data)
    },
    async linkAccount(account: any) {
      try {
        const existing = await p.account.findUnique({
          where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } },
        })
        if (existing) {
          await p.account.update({
            where: { id: existing.id },
            data: { access_token: account.access_token, refresh_token: account.refresh_token ?? existing.refresh_token, expires_at: account.expires_at, id_token: account.id_token, session_state: account.session_state },
          })
          return existing
        }
        return await p.account.create({
          data: { userId: account.userId, type: account.type, provider: account.provider, providerAccountId: account.providerAccountId, access_token: account.access_token, refresh_token: account.refresh_token, expires_at: account.expires_at, token_type: account.token_type, scope: account.scope, id_token: account.id_token, session_state: account.session_state },
        })
      } catch (error: any) {
        if (error?.code === "P2002") return
        throw error
      }
    },
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: CustomPrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 48 * 60 * 60 },
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = (credentials.email as string).toLowerCase().trim()
        const password = (credentials.password as string).trim()
        if (email === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
          return { ...ADMIN_USER_OBJECT } as any
        }
        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED")
          if (await bcrypt.compare(password, user.password)) return user
          return null
        } catch (dbError: any) {
          if (dbError.message === "EMAIL_NOT_VERIFIED") throw dbError
          throw new Error("DATABASE_UNAVAILABLE")
        }
      }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
    Credentials({
        id: "impersonation", name: "Impersonation",
        credentials: { token: { label: "Token", type: "text" } },
        async authorize(credentials) {
            if (!credentials?.token) return null
            try {
                const jwt = await import("jsonwebtoken")
                const secret = process.env.AUTH_SECRET
                if (!secret) throw new Error("Missing AUTH_SECRET")
                const payload = jwt.verify(credentials.token as string, secret) as any
                if (payload.type !== "impersonation" || !payload.targetUserId) throw new Error("Invalid token type")
                const user = await prisma.user.findUnique({ where: { id: payload.targetUserId } })
                if (!user) return null
                return user
            } catch (error) { console.error("Impersonation failed:", error); return null }
        }
    })
  ],
  events: {
    async createUser({ user }) {
        try {
            let validReferredByCode = 'COMPANY'
            try {
                const { cookies } = await import("next/headers")
                const cookieStore = await cookies()
                const referralCodeInput = cookieStore.get("referral_code")?.value
                if (referralCodeInput) {
                    const referrer = await prisma.user.findUnique({ where: { referralCode: referralCodeInput } })
                    if (referrer) validReferredByCode = referralCodeInput
                }
            } catch { /* cookie read may fail in some flows */ }

            const currentUser = await prisma.user.findUnique({ where: { id: user.id! } })
            
            if (!currentUser?.referralCode) {
                const newReferralCode = generateReferralCode()
                const newMemberId = generateMemberId()

                // NO signup bonus at registration — granted at unlock
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        referralCode: newReferralCode,
                        memberId: newMemberId,
                        referredByCode: validReferredByCode,
                        tier: "NEWBIE" as any,
                        tierStatus: "CURRENT" as any,
                        arnBalance: 0,
                        balance: 0,
                        activeMembers: 0,
                        totalDeposit: 0.0,
                        isActiveMember: false,
                        role: "USER"
                    }
                })

                // Create referral tree
                const referrer = await prisma.user.findUnique({
                    where: { referralCode: validReferredByCode },
                    select: { id: true, referralCode: true }
                })

                let advisorId = null, supervisorId = null, managerId = null
                if (referrer) {
                    advisorId = referrer.id
                    const referrerTree = await prisma.referralTree.findUnique({ where: { userId: referrer.id } })
                    if (referrerTree) {
                        supervisorId = referrerTree.advisorId
                        managerId = referrerTree.supervisorId
                    }
                }

                const existingTree = await prisma.referralTree.findUnique({ where: { userId: user.id! } })
                if (!existingTree) {
                    await prisma.referralTree.create({ data: { userId: user.id!, advisorId, supervisorId, managerId } })
                }

                // Check referrer's tier (new signup counts)
                if (referrer && referrer.referralCode !== 'COMPANY') {
                    try {
                        const { checkTierUpgrade } = await import("@/lib/mlm")
                        await checkTierUpgrade(referrer.id)
                    } catch { /* non-critical */ }
                }
                
                console.log(`✅ Google Signup: ${user.email} | Ref: ${validReferredByCode} | No bonus until unlock`)
            } else {
                // Existing user — ensure memberId
                if (!currentUser?.memberId || currentUser.memberId === currentUser.id) {
                    await prisma.user.update({ where: { id: user.id }, data: { memberId: generateMemberId() } })
                }
            }
        } catch (error) { console.error("❌ Google Signup Error:", error) }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials" || account?.provider === "impersonation") return true
      if (account?.provider === "google" && profile?.email) {
        try {
          const existingUser = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } })
          if (existingUser && !existingUser.emailVerified) {
            await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: new Date() } })
          }
        } catch { /* non-critical */ }
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
        if (user.id === "super-admin-id") { token.isActiveMember = true; token.memberId = "777777" }
        if (account?.provider === "google" && user.id && user.id !== "super-admin-id") {
          try {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
            if (dbUser) { token.role = dbUser.role; token.memberId = dbUser.memberId; token.isActiveMember = dbUser.isActiveMember }
          } catch { /* non-critical */ }
        }
        return token
      }
      if (!token.sub || token.sub === "super-admin-id") return token
      try {
        const existingUser = await prisma.user.findUnique({ where: { id: token.sub } })
        if (existingUser) { token.role = existingUser.role; token.memberId = existingUser.memberId; token.isActiveMember = existingUser.isActiveMember }
      } catch { /* non-critical */ }
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