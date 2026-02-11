import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { networkManager } from "@/lib/networks/NetworkManager";

export async function GET(req: NextRequest, { params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  return handlePostback(req, network);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  return handlePostback(req, network);
}

async function handlePostback(req: NextRequest, networkSlug: string) {
  try {
    const url = req.url;
    // Log initial request
    await prisma.postbackLog.create({
      data: {
        network: networkSlug,
        url: url,
        status: "PROCESSING",
      }
    });

    const validation = await networkManager.validatePostback(networkSlug, req);

    if (!validation.isValid) {
      await prisma.postbackLog.create({
        data: {
          network: networkSlug,
          url: url,
          status: "FAILED",
          error: validation.error || "Validation failed"
        }
      });
      return NextResponse.json({ status: "error", message: validation.error }, { status: 400 });
    }

    // Update log to processed
    // In a real scenario, you'd use the ID from the first log to update it, 
    // but for now we just log a completion or success.
    // Or we should assume logic to credit user here.
    
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Postback error:", error);
    await prisma.postbackLog.create({
      data: {
        network: networkSlug,
        status: "ERROR",
        error: error.message
      }
    });
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
