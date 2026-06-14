"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function generateImpersonationToken(targetUserId: string) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
             return { success: false, error: "Not authenticated" }
        }

        // 1. Verify Caller is Admin (Check DB directly to avoid stale session issues)
        const caller = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!caller || caller.role !== "ADMIN") {
            const role = caller?.role || session.user.role || "undefined";
            console.log(`❌ Impersonation Failed: User is not ADMIN. Role: ${role}`);
            return { success: false, error: `Unauthorized. Role: ${role}` }
        }

        // 2. Verify Target User Exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        })

        if (!targetUser) {
            return { success: false, error: "User not found" }
        }

        // 3. Generate Short-lived Token
        // using AUTH_SECRET which is used by NextAuth
        const secret = process.env.AUTH_SECRET
        if (!secret) {
             return { success: false, error: "Server configuration error" }
        }

        const token = jwt.sign(
            { 
                impersonatorId: session.user.id,
                targetUserId: targetUser.id,
                email: targetUser.email,
                type: "impersonation" 
            },
            secret,
            { expiresIn: "5m" } // Token valid for 5 minutes
        )

        return { success: true, token }

    } catch (error) {
        console.error("Impersonation Error:", error)
        return { success: false, error: "Failed to generate token" }
    }
}
