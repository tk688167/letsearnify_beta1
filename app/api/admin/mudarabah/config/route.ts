import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { isLive } = body;

    const config = await prisma.systemConfig.upsert({
      where: { key: "MUDARABAH_CONFIG" },
      update: {
        value: { isLive }
      },
      create: {
        key: "MUDARABAH_CONFIG",
        value: { isLive }
      }
    });

    return NextResponse.json(config.value);
  } catch (error) {
    console.error("POST mudarabah config error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
