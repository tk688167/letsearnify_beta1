"use server"

import { auth } from "@/auth"

/**
 * Upload proof image for task completion.
 * Sends to /api/upload/proof which handles file storage.
 */
export async function uploadProof(formData: FormData): Promise<{ error?: string; path?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Unauthorized" }
        }

        const file = formData.get("file") as File
        if (!file || file.size === 0) {
            return { error: "No file selected" }
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return { error: "Invalid file type. Use JPG, PNG, WEBP or GIF." }
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return { error: "File too large. Max size is 5MB." }
        }

        // Convert to base64 data URL for storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString("base64")
        const dataUrl = `data:${file.type};base64,${base64}`

        // For Vercel deployment, we store the base64 string directly as proof
        // The admin can view it directly since browsers render data URLs
        return { path: dataUrl }

    } catch (error: any) {
        console.error("Upload proof error:", error)
        return { error: error.message || "Failed to save file" }
    }
}