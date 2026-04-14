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

<<<<<<< HEAD
        // Validate max size (e.g. 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
            return { error: "File too large. Maximum size is 5MB." }
        }

        // Convert the image to a Base64 Data URI to safely store in DB directly.
        // This avoids read-only filesystem issues on serverless deployments like Vercel.
        const mimeType = file.type
        const base64Data = buffer.toString('base64')
        const dataUri = `data:${mimeType};base64,${base64Data}`
        
        // Return base64 string for DB
        return { success: true, path: dataUri }

    } catch (error: any) {
        console.error("Upload error:", error)
        return { error: "Failed to process file" }
=======
        return { success: true, path: uploaded.url }

    } catch (error: any) {
        console.error("Upload error:", error)
        return { error: error.message || "Failed to save file" }
>>>>>>> 77e88c235ee4b257f41ca79fc42314bdcb7eb2ec
    }
}
