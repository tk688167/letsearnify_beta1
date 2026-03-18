import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return new NextResponse("Invalid file type. Use JPG, PNG, WEBP or GIF.", { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File too large. Max size is 5MB.", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `pool-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "pools");

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/pools/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
