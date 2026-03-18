import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pools = await (prisma as any).mudarabahPool.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { investments: true }
        }
      }
    });

    let config = await prisma.systemConfig.findUnique({
      where: { key: "MUDARABAH_CONFIG" }
    });

    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          key: "MUDARABAH_CONFIG",
          value: { isLive: false }
        }
      });
    }

    return NextResponse.json({ pools, config: config.value });
  } catch (error) {
    console.error("GET mudarabah pools error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, targetAmount, minDeposit, maxDeposit, durationMonths, imageUrl } = body;

    if (!title || !targetAmount || !minDeposit || !maxDeposit || !durationMonths) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const pool = await (prisma as any).mudarabahPool.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        targetAmount: parseFloat(targetAmount),
        minDeposit: parseFloat(minDeposit),
        maxDeposit: parseFloat(maxDeposit),
        durationMonths: parseInt(durationMonths),
        status: "OPEN",
        isLive: false,
      }
    });

    return NextResponse.json(pool);
  } catch (error) {
    console.error("POST mudarabah pools error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
