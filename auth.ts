import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { generateReferralCode } from "@/lib/mlm"

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
        try {
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            const email = (credentials.email as string).toLowerCase().trim();
            const password = credentials.password as string;

            // --- EMERGENCY ADMIN ACCESS (OFFLINE/RECOVERY) ---
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
                console.warn("🚨 Emergency Admin Login Used");
                return {
                    id: "super-admin-id",
                    email: adminEmail,
                    name: "Super Admin",
                    role: "ADMIN",
                    image: null,
                    // Required User Fields
                    memberId: "777777",
                    isActiveMember: true,
                    totalDeposit: 5000.0,
                    emailVerified: new Date(),
                    referralCode: "SUPER-ADMIN",
                    arnBalance: 1000,
                    tier: "EMERALD",
                    tierStatus: "CURRENT"
                } as any
            }
            // -------------------------------------------------
            
            const user = await prisma.user.findUnique({
              where: { email }
            })

            if (!user || !user.password) {
                return null
            }

            // --- AUTHENTICATED CHECK ---
            const passwordsMatch = await bcrypt.compare(password, user.password)

            if (passwordsMatch) {
                console.log("✅ Login Successful for:", user.email)
                return user
            }
            
            console.log("❌ Login Failed: Password mismatch")
            return null
        } catch (error) {
            console.error("🔥 Auth Error (Authorizing):", error);
            return null;
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

                // Verify target user still exists
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

            // Resolve Referrer
            let validReferredByCode = 'COMPANY'; // Default
            
            if (referralCodeInput) {
                const referrer = await prisma.user.findUnique({ 
                    where: { referralCode: referralCodeInput } 
                });
                if (referrer) {
                    validReferredByCode = referralCodeInput;
                }
            }

            // Generate Schema-Required Fields
            const newReferralCode = generateReferralCode();

            // Update User with MLM info
            // The user is already created by the adapter, we just update the missing fields
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
                    role: "USER" // Explicitly ensure role
                }
            });

            // Build Referral Tree
            let advisorId = null;
            let supervisorId = null;
            let managerId = null;
            
            // Find the actual referrer object (Company or User)
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
      // Initial sign in
      if (user) {
        token.role = user.role
        token.id = user.id
        // Handle Bypass User
        if (user.id === "super-admin-id") {
            token.isActiveMember = true
            token.memberId = "777777"
        }
        return token
      }
      
      // Subsequent checking - fetch from DB to get latest role
      if (!token.sub) return token

      // --- ADMIN BYPASS PERSISTENCE ---
      if (token.sub === "super-admin-id") {
          return token; // Skip DB check for test admin
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
        // Keep existing token data if DB fails, don't crash the session
      }
      return token
    }
  }
})
