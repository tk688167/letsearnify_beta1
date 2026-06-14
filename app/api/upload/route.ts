import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFileToSupabase } from "@/lib/supabase-storage";
import type { UploadKind } from "@/lib/upload-types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const kind = ((formData.get("kind") as string) || "").trim() as UploadKind;
    const uploadKind: UploadKind =
      kind || (session.user.role === "ADMIN" ? "pool-image" : "profile-image");

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    if (
      (uploadKind === "pool-image" || uploadKind === "payout-proof" || uploadKind === "wallet-qr") &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const uploaded = await uploadFileToSupabase({
      file,
      kind: uploadKind,
      userId: session.user.id,
    });

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return new NextResponse(message, { status: 500 });
  }
}
