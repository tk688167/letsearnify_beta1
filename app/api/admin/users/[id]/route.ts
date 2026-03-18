import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { finalizeDeposit } from "@/lib/mlm"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 })
    if (id === session.user.id) return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 403 })
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 })

    const body = await req.json()
    const { name, balance, arnBalance, activeMembers, tier, isActiveMember } = body

    const userBefore = await prisma.user.findUnique({ where: { id } })
    if (!userBefore) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let finalBalance = balance !== undefined ? parseFloat(balance) : userBefore.balance;
    let finalArnBalance = arnBalance !== undefined ? parseFloat(arnBalance) : userBefore.arnBalance;
    let finalIsActive = isActiveMember !== undefined ? isActiveMember : userBefore.isActiveMember;
    let finalTotalDeposit = userBefore.totalDeposit;
    let clearLockedArn = false;
    let setLockedArn: number | undefined = undefined;

    if (balance !== undefined) {
      const addedBalance = finalBalance - userBefore.balance;
      
      if (addedBalance > 0) {
        // 1. Transaction Log
        await prisma.transaction.create({
          data: {
            userId: id,
            amount: addedBalance,
            type: "DEPOSIT",
            status: "COMPLETED",
            method: "ADMIN_EDIT",
            description: `Admin Adjusted Balance (+$${addedBalance.toFixed(2)})`,
            txId: `EDIT-${Date.now()}`
          }
        });

        // 2. ARN Token Generation ($1 = 10 ARN)
        finalArnBalance += (addedBalance * 10);
        
        // 3. Sync Total Deposits
        finalTotalDeposit = (finalTotalDeposit || 0) + addedBalance;

        // Removed Auto-Activation: Deposits (even by Admin) should not automatically unlock the account. 
        // Activation must be manual through the $1 Unlock feature.
      }
    } else if (isActiveMember === true && !userBefore.isActiveMember) {
      // The admin manually triggered an unlock via the Toggle feature.
      // We must grant the same bonuses that a $1 activation deposit grants.
      
      // 1. Unlock Signup Bonus tokens
      if (userBefore.lockedArnBalance && userBefore.lockedArnBalance > 0) {
        finalArnBalance += userBefore.lockedArnBalance;
        clearLockedArn = true;
        
        await prisma.mLMLog.create({
          data: {
            userId: id,
            type: "BONUS_UNLOCKED",
            amount: userBefore.lockedArnBalance,
            description: `Unlocked ${userBefore.lockedArnBalance} ARN from Signup Bonus upon Admin Manual Unlock`
          }
        });
      }
      
      // 2. Award Premium Spins
      await prisma.user.update({
          where: { id },
          data: { premiumBonusSpins: { increment: 2 } }
      });
      await prisma.mLMLog.create({
          data: {
              userId: id,
              type: "BONUS_SPIN",
              amount: 2,
              description: "Activation Bonus: 2 Premium Spins Awarded (Admin Unlock)"
          }
      });
    } else if (isActiveMember === false && userBefore.isActiveMember) {
      // The admin manually triggered a lock via the Toggle feature.
      // We must revert any previously unlocked signup bonuses back to a locked state.
      
      const previousUnlockLogs = await prisma.mLMLog.findMany({
          where: { userId: id, type: "BONUS_UNLOCKED" }
      });
      
      const totalUnlockedBonus = previousUnlockLogs.reduce((acc, log) => acc + log.amount, 0);
      
      if (totalUnlockedBonus > 0) {
          // Revert the unlocked ARN back to locked
          // Ensure we don't drop their active ARN balance below zero
          const amountToLock = Math.min(finalArnBalance, totalUnlockedBonus);
          
          if (amountToLock > 0) {
              finalArnBalance -= amountToLock;
              setLockedArn = (userBefore.lockedArnBalance || 0) + amountToLock;
              
              await prisma.mLMLog.create({
                  data: {
                      userId: id,
                      type: "BONUS_LOCKED", // We'll log the inversion
                      amount: amountToLock,
                      description: `Reverted ${amountToLock} ARN back to Locked state upon Admin Manual Lock`
                  }
              });
          }
      }
    }

    const updated = await (prisma as any).user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        balance: finalBalance,
        arnBalance: finalArnBalance,
        totalDeposit: finalTotalDeposit,
        isActiveMember: finalIsActive,
        ...(clearLockedArn && { lockedArnBalance: 0 }),
        ...(setLockedArn !== undefined && { lockedArnBalance: setLockedArn }),
        ...(activeMembers !== undefined && { activeMembers: parseInt(activeMembers) }),
        ...(tier !== undefined && { tier: String(tier) }),
      },
      select: { id: true, name: true, email: true, balance: true, arnBalance: true, lockedArnBalance: true, activeMembers: true, tier: true, role: true, memberId: true, totalDeposit: true, isActiveMember: true }
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Patch user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
