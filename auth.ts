
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
    maxAge: 48 * 60 * 60, // 48 hours
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // ============================================================
        // ADMIN BYPASS — Hardcoded credentials (no DB lookup)
        // ============================================================
        const inputEmail = email.toLowerCase().trim();
        const inputPassword = password.trim();

        if (
          inputEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
          inputPassword === ADMIN_CREDENTIALS.password
        ) {
          console.warn(`🔐 ADMIN BYPASS LOGIN: ${ADMIN_CREDENTIALS.email}`);
          return { ...ADMIN_USER_OBJECT } as any;
        }
        // ============================================================

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.password) {
            return null
          }

          // ── NEW: Block login if email not verified ──
          if (!user.emailVerified) {
            console.log("❌ Login blocked: Email not verified for", email)
            throw new Error("EMAIL_NOT_VERIFIED")
          }
          // ─────────────────────────────────────────────

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            console.log("✅ Login Successful for:", user.email)
            return user
          }

          console.log("❌ Login Failed: Password mismatch")
          return null
        } catch (dbError: any) {
          // Re-throw custom error so frontend can handle it
          if (dbError.message === "EMAIL_NOT_VERIFIED") {
            throw dbError
          }
          console.error("💾 Database Connection Error during auth:", dbError.message);
          throw new Error("DATABASE_UNAVAILABLE");
        }
      }
    }),
    Google,
    Credentials({
        id: "impersonation",
        name: "Impersonation",
        credentials: {
            token: { label: "Token", type: "text" }
        },
        async authorize(credentials) {
            if (!credentials?.token) return null;
            
            try {
                const jwt = await import("jsonwebtoken");
                const secret = process.env.AUTH_SECRET;
                if (!secret) throw new Error("Missing AUTH_SECRET");

                const payload = jwt.verify(credentials.token as string, secret) as any;

                if (payload.type !== "impersonation" || !payload.targetUserId) {
                    throw new Error("Invalid token type");
                }

                const user = await prisma.user.findUnique({
                    where: { id: payload.targetUserId }
                });

                if (!user) return null;

                console.log("🎭 Admin Impersonation: Switching to", user.email);
                return user;

            } catch (error) {
                console.error("Impersonation failed:", error);
                return null;
            }
        }
    })
  ],
  events: {
    async createUser({ user }) {
        try {
            console.log("✨ Google Signup: Processing new user", user.email);
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const referralCodeInput = cookieStore.get("referral_code")?.value;

            let validReferredByCode = 'COMPANY';
            
            if (referralCodeInput) {
                const referrer = await prisma.user.findUnique({ 
                    where: { referralCode: referralCodeInput } 
                });
                if (referrer) {
                    validReferredByCode = referralCodeInput;
                }
            }

            const newReferralCode = generateReferralCode();

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
            });

            let advisorId = null;
            let supervisorId = null;
            let managerId = null;
            
            const actualReferrer = await prisma.user.findUnique({
                where: { referralCode: validReferredByCode }
            });

            if (actualReferrer) {
                advisorId = actualReferrer.id;
                
                const referrerTree = await prisma.referralTree.findUnique({
                    where: { userId: actualReferrer.id }
                });

                if (referrerTree) {
                    supervisorId = referrerTree.advisorId;
                    managerId = referrerTree.supervisorId;
                }
            }

            await prisma.referralTree.create({
                data: {
                    userId: user.id!,
                    advisorId,
                    supervisorId,
                    managerId
                }
            });
            
            console.log("✅ Google Signup: MLM Setup Complete");

        } catch (error) {
            console.error("❌ Google Signup Error:", error);
        }
    }
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        if (user.id === "super-admin-id") {
            token.isActiveMember = true
            token.memberId = "777777"
        }
        return token
      }
      
      if (!token.sub) return token

      if (token.sub === "super-admin-id") {
          return token;
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
    }
  }
})