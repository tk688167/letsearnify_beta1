"use server"

import { auth } from "@/auth"
import { sendWaitlistConfirmEmail } from "@/lib/email"

export async function joinWaitlist(featureName: string) {
    const session = await auth()

    if (!session?.user?.email) {
        return { success: false, error: "You must be logged in to join the waitlist." }
    }

    try {
        const result = await sendWaitlistConfirmEmail(session.user.email, featureName)
        
        if (result.success) {
            return { success: true }
        } else {
            return { success: false, error: "Failed to send confirmation email." }
        }
    } catch (error) {
        console.error("Waitlist error:", error)
        return { success: false, error: "An unexpected error occurred." }
    }
}
