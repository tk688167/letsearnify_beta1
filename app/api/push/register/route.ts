import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription is required" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        keys: subscription.keys,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
    });

    console.log("✅ Push subscription registered for admin");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Push registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Push unregistration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unregister" },
      { status: 500 }
    );
  }
}