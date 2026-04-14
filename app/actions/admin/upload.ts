"use server"

import { auth } from "@/auth"
import { uploadFileToSupabase } from "@/lib/supabase-storage"

export async function uploadQRCode(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
        return { error: "No file provided" }
    }

    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" }
    }

    try {
        const uploaded = await uploadFileToSupabase({
            file,
            kind: "wallet-qr",
            userId: session.user.id,
        })

        return { success: true, path: uploaded.url }

    } catch (error: any) {
        console.error("Upload error:", error)
        return { error: error.message || "Failed to save file" }
    }
}
