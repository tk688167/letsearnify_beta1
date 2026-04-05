import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature } from "@/lib/nowpayments";
import { finalizeDeposit } from "@/lib/mlm";

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-nowpayments-sig");
        if (!signature) {
             return NextResponse.json({ error: "Missing Signature" }, { status: 400 });
        }

        const body = await req.json(); // NOWPayments sends JSON body
        
        const isValid = verifySignature(body, signature);
        if (!isValid) return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });

        console.log("NOWPayments Webhook Received:", body);

        const { 
            payment_status, 
            payment_id, 
            order_id, 
            pay_amount, 
            pay_currency,
            price_amount 
        } = body;

        // Statuses: waiting, confirming, confirmed, sending, finished, failed, refunding, expired
        if (payment_status === "finished" || payment_status === "confirmed") {
            
            // Find the transaction using order_id which we stored as txId or we stored payment_id?
            // Strategy: When creating payment, we create a Transaction with id = order_id (if we generate it) or we store payment_id.
            // Let's assume order_id is the Transaction ID in our DB.
            
            const transaction = await prisma.transaction.findUnique({
                where: { id: order_id } 
            });

            if (!transaction) {
                 console.error(`Transaction not found for Order ID: ${order_id}`);
                 return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
            }

            if (transaction.status === "COMPLETED") {
                return NextResponse.json({ message: "Already completed" });
            }

            // Update Transaction & User Balance
            // Update Transaction & User Balance & Trigger MLM Logic
            await prisma.$transaction(async (tx: any) => {
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: "COMPLETED",
                        method: `NOWPayments (${pay_currency})`,
                        description: `[VERIFIED_NOWPAYMENTS] Payment ID: ${payment_id}`,
                        txId: payment_id.toString()
                    }
                });

                await tx.user.update({
                    where: { id: transaction.userId },
                    data: {
                        balance: { increment: price_amount },
                        dailyEarningWallet: { increment: price_amount }
                    }
                });

                // Trigger MLM & Pools
                await finalizeDeposit(transaction.userId, price_amount, transaction.id, "NOWPayments Deposit", tx);
            });
            
            console.log(`Payment ${payment_id} confirmed. User ${transaction.userId} credited $${price_amount}.`);
        } else if (payment_status === "failed" || payment_status === "expired") {
             const transaction = await prisma.transaction.findUnique({ where: { id: order_id } });
             if (transaction && transaction.status === "PENDING") {
                 await prisma.transaction.update({
                     where: { id: transaction.id },
                     data: { status: "FAILED", description: `NOWPayments Status: ${payment_status}` }
                 });
             }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
