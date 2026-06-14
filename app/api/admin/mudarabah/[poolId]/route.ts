import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pool = await (prisma as any).mudarabahPool.findUnique({
      where: { id: poolId },
      include: {
        investments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        distributions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!pool) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(pool);
  } catch (error) {
    console.error("GET mudarabah pool error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const pool = await (prisma as any).mudarabahPool.update({
      where: { id: poolId },
      data: {
        ...body
      }
    });

    return NextResponse.json(pool);
  } catch (error) {
    console.error("PATCH mudarabah pool error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await (prisma as any).mudarabahPool.delete({
      where: { id: poolId }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("DELETE mudarabah pool error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
