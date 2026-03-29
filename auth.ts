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
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
            return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
            return null
        }

        if (!user.password) {
            return null
        }

        // --- AUTHENTICATED CHECK ---
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string, 
          user.password
        )

        if (passwordsMatch) {
            console.log("✅ Login Successful for:", user.email)

            // --- AUTO-RESET LOGIC FOR TEST ACCOUNTS ---
            const emailLower = user.email?.toLowerCase() || "";
            if (
                emailLower.includes("@test.com") || 
                emailLower.includes("+test") || 
                emailLower.startsWith("dev_")
            ) {
                console.log("🔄 Auto-Resetting Test Account:", user.email);
                
                // Keep password and basic info, reset MLM progress
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        tier: "NEWBIE" as any, // Cast to any until Prisma Client is regenerated
                        tierStatus: "CURRENT" as any, 
                        points: 0,
                        activeMembers: 0,
                        isActiveMember: false,
                        totalDeposit: 0
                    }
                });
                
                // Fetch fresh user data to return correct session
                const refreshedUser = await prisma.user.findUnique({ where: { id: user.id } });
                return refreshedUser;
            }

            return user
        }
        
        console.log("❌ Login Failed: Password mismatch")
        return null
      }
    }),
    Google
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
                    points: 0,
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
        return token
      }
      
      // Subsequent checking - fetch from DB to get latest role
      if (!token.sub) return token
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub }
        })
        
        if (existingUser) {
          token.role = existingUser.role
          token.memberId = existingUser.memberId
        }
      } catch (error) {
        console.error("Error fetching user in JWT callback:", error)
        // Keep existing token data if DB fails, don't crash the session
      }
      return token
    }
  }
})
