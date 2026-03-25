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

    // Delete all related records that don't have onDelete: Cascade
    // Do this in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete referral commissions (both as earner and source)
      await tx.referralCommission.deleteMany({ where: { earnerId: id } })
      await tx.referralCommission.deleteMany({ where: { sourceUserId: id } })

      // Delete admin logs targeting this user
      await tx.adminLog.deleteMany({ where: { targetUserId: id } })

      // Delete referral tree
      await tx.referralTree.deleteMany({ where: { userId: id } })

      // Update referral trees that reference this user as upline
      await tx.referralTree.updateMany({ where: { advisorId: id }, data: { advisorId: null } })
      await tx.referralTree.updateMany({ where: { supervisorId: id }, data: { supervisorId: null } })
      await tx.referralTree.updateMany({ where: { managerId: id }, data: { managerId: null } })

      // Update users who were referred by this user
      await tx.user.updateMany({ where: { referredByCode: (await tx.user.findUnique({ where: { id }, select: { referralCode: true } }))?.referralCode || '' }, data: { referredByCode: 'COMPANY' } })

      // Now delete the user — cascade handles the rest
      // (accounts, sessions, transactions, task completions, investments, etc.)
      await tx.user.delete({ where: { id } })
    }, {
      maxWait: 10000,
      timeout: 30000,
    })

    return NextResponse.json({ message: "User and all related data deleted successfully" })
  } catch (error: any) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: `Failed to delete user: ${error?.message?.substring(0, 150) || 'Unknown error'}` }, { status: 500 })
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

    // Validate tier value if provided
    if (tier !== undefined && !Object.values(Tier).includes(tier)) {
      return NextResponse.json({ error: "Invalid tier value" }, { status: 400 })
    }

    const userBefore = await prisma.user.findUnique({ where: { id } })
    if (!userBefore) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let finalBalance = balance !== undefined ? parseFloat(balance) : userBefore.balance;
    let finalArnBalance = arnBalance !== undefined ? parseFloat(arnBalance) : userBefore.arnBalance;
    let finalIsActive = isActiveMember !== undefined ? isActiveMember : userBefore.isActiveMember;
    let finalTotalDeposit = userBefore.totalDeposit;

    // Handle balance increase by admin (treat as manual deposit)
    if (balance !== undefined) {
      const addedBalance = finalBalance - userBefore.balance;
      
      if (addedBalance > 0) {
        // Log the admin adjustment as a transaction
        await prisma.transaction.create({
          data: {
            userId: id,
            amount: addedBalance,
            type: "DEPOSIT",
            status: "COMPLETED",
            method: "ADMIN_EDIT",
            description: `Admin adjusted balance (+$${addedBalance.toFixed(2)})`,
            arnMinted: addedBalance * 10,
            txId: `EDIT-${Date.now()}`
          }
        });

        // Auto-mint ARN for the added balance (10 ARN per $1)
        finalArnBalance += (addedBalance * 10);
        
        // Update total deposits
        finalTotalDeposit = (finalTotalDeposit || 0) + addedBalance;
      }
    }

    // Handle admin manually unlocking account
    if (isActiveMember === true && !userBefore.isActiveMember) {
      // Award premium spins on manual unlock
      await prisma.user.update({
          where: { id },
          data: { premiumBonusSpins: { increment: 2 } }
      });

      await prisma.mLMLog.create({
          data: {
              userId: id,
              type: "ADMIN_UNLOCK",
              amount: 0,
              description: "Account unlocked by Admin. 2 Premium Spins awarded."
          }
      });

      // Set unlock expiry (3 months)
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 3);
      await prisma.user.update({
          where: { id },
          data: { 
            lastUnlockAt: new Date(),
            unlockExpiry: expiry,
            lastActivityAt: new Date()
          }
      });
    }

    // Handle admin manually locking account
    if (isActiveMember === false && userBefore.isActiveMember) {
      await prisma.mLMLog.create({
          data: {
              userId: id,
              type: "ADMIN_LOCK",
              amount: 0,
              description: "Account locked by Admin."
          }
      });
    }

    // Apply the update
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        balance: finalBalance,
        arnBalance: finalArnBalance,
        totalDeposit: finalTotalDeposit,
        isActiveMember: finalIsActive,
        ...(activeMembers !== undefined && { activeMembers: parseInt(activeMembers) }),
        ...(tier !== undefined && { tier: tier as Tier }),
      },
      select: { 
        id: true, name: true, email: true, balance: true, arnBalance: true, 
        activeMembers: true, tier: true, role: true, memberId: true, 
        totalDeposit: true, isActiveMember: true 
      }
    })

    // Check tier upgrade after admin edit
    try {
      const { checkTierUpgrade } = await import("@/lib/mlm")
      await checkTierUpgrade(id)
    } catch (e) {
      console.warn("Tier check after admin edit failed:", e)
    }

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    console.error("Patch user error:", error)
    return NextResponse.json({ error: `Failed to update user: ${error?.message?.substring(0, 150) || 'Unknown error'}` }, { status: 500 })
  }
}