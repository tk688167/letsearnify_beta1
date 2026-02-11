import { prisma } from "@/lib/prisma";

/**
 * Token Constants
 */
export const ARN_CONVERSION_RATE = 10; // 1 USD = 10 ARN

/**
 * Mints ARN tokens for a user based on their USD deposit.
 * 
 * @param userId - The ID of the user receiving tokens
 * @param depositAmount - The amount of USD deposited
 * @param txId - The transaction ID associated with the deposit
 */
export async function mintArnForDeposit(userId: string, depositAmount: number, txId: string, tx?: any) {
    if (depositAmount <= 0) return;

    const tokensToMint = depositAmount * ARN_CONVERSION_RATE;
    const db = tx || prisma;

    try {
        if (tx) {
            // Already in a transaction, run sequentially
            await db.user.update({
                where: { id: userId },
                data: {
                    arnBalance: { increment: tokensToMint },
                    totalDeposit: { increment: depositAmount },
                    isActiveMember: true
                }
            });

            await db.transaction.update({
                where: { id: txId },
                data: { arnMinted: tokensToMint }
            });

            await db.mLMLog.create({
                data: {
                    userId: userId,
                    type: "TOKEN_MINT",
                    amount: tokensToMint,
                    description: `Minted ${tokensToMint} ARN for deposit of $${depositAmount}`
                }
            });

        } else {
            // New transaction
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        arnBalance: { increment: tokensToMint },
                        totalDeposit: { increment: depositAmount },
                        isActiveMember: true
                    }
                }),
                prisma.transaction.update({
                    where: { id: txId },
                    data: { arnMinted: tokensToMint }
                }),
                prisma.mLMLog.create({
                    data: {
                        userId: userId,
                        type: "TOKEN_MINT",
                        amount: tokensToMint,
                        description: `Minted ${tokensToMint} ARN for deposit of $${depositAmount}`
                    }
                })
            ]);
        }

        console.log(`[TOKEN_SYSTEM] Minted ${tokensToMint} ARN for user ${userId}`);

    } catch (error) {
        console.error("[TOKEN_SYSTEM] Failed to mint tokens:", error);
        throw error; // Propagate error to caller (especially if inside a transaction)
    }
}

/**
 * Checks if a user has enough ARN for a specific tier requirement.
 */
export async function checkArnQualification(userId: string, requiredAmount: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { arnBalance: true }
    });
    
    if (!user) return false;
    return user.arnBalance >= requiredAmount;
}
