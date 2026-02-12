"use server"

import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { cwd } from "process"

export async function uploadProof(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
        return { error: "No file provided" }
    }

    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" }
    }

    // simplistic: in prod use UUID or safe naming
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
    const filename = `${timestamp}-${session.user?.id.slice(0,5)}-${safeName}`
    
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = join(cwd(), "public", "uploads", "proofs")
        await mkdir(uploadDir, { recursive: true })

        const path = join(uploadDir, filename)
        await writeFile(path, buffer)
        
        // Return relative path for DB
        return { success: true, path: `/uploads/proofs/${filename}` }

    } catch (error: any) {
        console.error("Upload error:", error)
        return { error: "Failed to save file" }
    }
}
