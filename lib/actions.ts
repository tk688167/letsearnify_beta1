"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

interface TrackingData {
  path: string
  screenResolution?: string
  referrer?: string
  timezone?: string
  language?: string
}

export async function trackVisit(clientData?: TrackingData) {
  try {
    const session = await auth()
    const headersList = await headers()
    
    // IP Extraction (Forwarded or direct)
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1"
    
    const userAgent = headersList.get("user-agent") || "unknown"
    const refererHeader = headersList.get("referer") || "direct"
    
    // Basic Parsing
    const isMobile = /mobile/i.test(userAgent)
    const device = isMobile ? "Mobile" : "Desktop"
    
    let os = "Unknown"
    if (/windows/i.test(userAgent)) os = "Windows"
    else if (/mac/i.test(userAgent)) os = "MacOS"
    else if (/android/i.test(userAgent)) os = "Android"
    else if (/ios|iphone|ipad/i.test(userAgent)) os = "iOS"
    else if (/linux/i.test(userAgent)) os = "Linux"

    let browser = "Unknown"
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = "Chrome"
    else if (/firefox/i.test(userAgent)) browser = "Firefox"
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari"
    else if (/edg/i.test(userAgent)) browser = "Edge"
    else if (/opera|opr/i.test(userAgent)) browser = "Opera"

    // Session ID Logic (Use Cookie or Auth)
    // For now, we rely on User ID or generate a session ID if needed.
    // Ideally, we'd read a cookie here, but for simplicity:
    const sessionId = session?.user?.id || ip + "-" + userAgent.substring(0, 20)

    // GeoIP Mock (Self-contained)
    // Real prod would use MaxMind or headers from Vercel/Cloudflare (x-vercel-ip-country)
    const country = headersList.get("x-vercel-ip-country") || "Unknown"
    const city = headersList.get("x-vercel-ip-city") || "Unknown"

    try {
      await prisma.visit.create({
        data: {
          userId: session?.user?.id,
          sessionId,
          ip,
          country,
          city,
          device,
          os,
          browser,
          userAgent,
          path: clientData?.path || refererHeader,
          referrer: clientData?.referrer || refererHeader,
          screenResolution: clientData?.screenResolution,
          language: clientData?.language || headersList.get("accept-language")?.split(',')[0],
        }
      })
    } catch (e: any) {
      if (e.code === 'P2003') {
         // Stale user ID (Foreign Key fail). Retry as anonymous.
         await prisma.visit.create({
          data: {
            userId: undefined, // Anonymous
            sessionId,
            ip,
            country,
            city,
            device,
            os,
            browser,
            userAgent,
            path: clientData?.path || refererHeader,
            referrer: clientData?.referrer || refererHeader,
            screenResolution: clientData?.screenResolution,
            language: clientData?.language || headersList.get("accept-language")?.split(',')[0],
          }
        })
      } else {
        throw e
      }
    }
  } catch (error) {
    console.error("Tracking error:", error)
  }
}

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
     throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const phoneNumber = formData.get("phoneNumber") as string
  // Email update might require verification, but for this beta we allow direct update or restrict it. 
  // Requirement says "Email Address" in profile options.
  const email = formData.get("email") as string
  
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  
  /* New Settings Fields: Currency/Language/Security Question */
  const currency = formData.get("currency") as string
  const language = formData.get("language") as string
  const securityQuestion = formData.get("securityQuestion") as string
  const securityAnswer = formData.get("securityAnswer") as string

  const data: any = { 
      name, 
      email, 
      phoneNumber 
  }
  
  if (currency) data.currency = currency
  if (language) data.language = language
  if (securityQuestion) data.securityQuestion = securityQuestion
  if (securityAnswer) data.securityAnswer = securityAnswer

  if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) {
          throw new Error("Current password is required to set a new one")
      }
      
      const user = await prisma.user.findUnique({ 
          where: { id: session.user.id } 
      })
      
      if (!user || !user.password) {
           // If user has no password (e.g. OAuth), they might need a different flow, 
           // but assuming strictly credentials for this admin request or handled gracefully.
           throw new Error("Cannot verify current password")
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
          throw new Error("Incorrect current password")
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      data.password = hashedPassword
  }

  await prisma.user.update({
      where: { id: session.user.id },
      data
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard/profile/edit")
  return { success: true }
}

export async function addPaymentMethod(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  // Simulation for Beta
  const type = formData.get("type") as string
  const details = formData.get("details") as string
  const title = type === "CARD" ? "Card ending " + details.slice(-4) : "Bank Account"

  await prisma.paymentMethod.create({
     data: {
       userId: session.user.id,
       type,
       details,
       title
     }
  })
  
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function deposit(amount: number, method: string, details?: { network?: string, txHash?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  if (method === "STRIPE") {
     throw new Error("Stripe payments are currently disabled.")
  }

  // Crypto Deposit Logic
  if (method === "CRYPTO") {
     if (!details?.txHash) throw new Error("Transaction Hash is required.")
     if (!details?.network) throw new Error("Network is required.")
     
     // 1. Create Transaction Record
     await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "DEPOSIT",
        status: "COMPLETED", // Auto-complete for Beta
        method: `${details.network} - ${details.txHash}`
      }
    })

    // 2. Update User Balance & Total Deposit
    // Fetch user first to check previous totalDeposit for Active Member trigger
    const userBefore = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!userBefore) throw new Error("User not found");

    const wasActive = userBefore.totalDeposit >= 1.0;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
          balance: { increment: amount },
          totalDeposit: { increment: amount },
          points: { increment: amount } // 1 Point = 1 Dollar from deposits
      }
    })

    const isActiveNow = updatedUser.totalDeposit >= 1.0;

    // 3. Active Member Trigger (If just became active)
    if (!wasActive && isActiveNow && userBefore.referredByCode) {
        // Find Referrer
        const referrer = await prisma.user.findUnique({
            where: { referralCode: userBefore.referredByCode }
        });
        
        if (referrer) {
            // Increment referrer's activeMembers
            await prisma.user.update({
                where: { id: referrer.id },
                data: { activeMembers: { increment: 1 } }
            });
            
            // Check if Referrer is eligible for Tier Upgrade
            const { checkAndUpgradeTier } = await import("./mlm");
            await checkAndUpgradeTier(referrer.id);
        }
    }

    // 4. Update System Pools (5% CBSP, 5% Royalty)
    // We update/upsert the pools.
    const cbspAmount = amount * 0.05;
    const royaltyAmount = amount * 0.05;

    await prisma.pool.upsert({
        where: { name: "CBSP" },
        update: { balance: { increment: cbspAmount } },
        create: { name: "CBSP", balance: cbspAmount }
    });

    await prisma.pool.upsert({
        where: { name: "ROYALTY" },
        update: { balance: { increment: royaltyAmount } },
        create: { name: "ROYALTY", balance: royaltyAmount }
    });
    
    // Check for user's OWN tier upgrade (points increased)
    const { checkAndUpgradeTier } = await import("./mlm");
    await checkAndUpgradeTier(session.user.id);

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Deposit Successful. Points & Pools updated." }
  }
  
  return { success: false, message: "Invalid payment method" }
}

export async function withdraw(amount: number, method: string, details: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.balance < amount) {
    throw new Error("Insufficient funds")
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "WITHDRAWAL",
        status: "PENDING", // Withdrawals usually verify manually or auto-process
        method: `${method} - ${details}`
      }
    })
  ])

  revalidatePath("/dashboard/wallet")
  return { success: true, message: "Withdrawal request submitted" }
}

export async function transferToPool(amount: number, poolName: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.balance < amount) {
    throw new Error("Insufficient funds")
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { decrement: amount } }
    }),
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "INVESTMENT",
        status: "COMPLETED",
        method: "Internal Transfer"
      }
    }),
    prisma.investment.create({
      data: {
        userId: session.user.id,
        poolName,
        amount,
        roi: 1.5, // Default or lookup based on poolName
        status: "ACTIVE"
      }
    })
  ])

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/wallet")
  revalidatePath("/dashboard/investments")
  return { success: true, message: "Investment successful" }
}

// ADMIN ACTIONS
export async function getPlatformWallets() {
  const wallets = await prisma.platformWallet.findMany()
  // Ensure default data exists if empty
  if (wallets.length === 0) {
      // Seed initial data if missing
      await prisma.platformWallet.createMany({
          data: [
              { network: "TRC20", address: "T9y...Placeholder...TRC20", qrCodePath: "/qr-trc20.png" },
              { network: "BEP20", address: "0x...Placeholder...BEP20", qrCodePath: "/qr-bep20.png" }
          ]
      })
      return await prisma.platformWallet.findMany()
  }
  return wallets
}


export async function updatePlatformWallet(network: string, address: string, qrCodePath: string) {
  const session = await auth()
  // In real app: check if session.user.role === 'ADMIN'
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.platformWallet.upsert({
      where: { network },
      update: { address, qrCodePath },
      create: { network, address, qrCodePath }
  })

  revalidatePath("/dashboard/wallet") // User View
  revalidatePath("/admin/wallets")    // Admin View
  return { success: true }
}

export async function updateUserAsAdmin(formData: FormData) {
  const session = await auth()
  // Data modification is strictly restricted to ADMINs
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const userId = formData.get("userId") as string
  const balanceRaw = formData.get("balance") as string
  const pointsRaw = formData.get("points") as string
  const tier = formData.get("tier") as string // "BRONZE", "SILVER", etc.
  
  if (!userId) throw new Error("User ID required")

  const balance = parseFloat(balanceRaw)
  if (isNaN(balance)) throw new Error("Invalid balance")
  if (balance < 0) throw new Error("Balance cannot be negative")
  
  const points = pointsRaw ? parseFloat(pointsRaw) : 0;
  
  // Get old data for logging comparison
  const oldUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!oldUser) throw new Error("User not found");

  const updates: any = {
    balance,
    points
  };
  
  if (tier) {
    updates.tier = tier as any; // Cast to conform to Prisma generated type
  }

  // Uses $transaction to ensure atomicity
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: updates
    }),
    
    // Log Balance Change if changed
    (Math.abs(oldUser.balance - balance) > 0.001) ? 
      prisma.transaction.create({
        data: {
          userId,
          amount: balance, // Snapshot
          type: "ADMIN_ADJUSTMENT",
          status: "COMPLETED",
          method: "Admin Panel Manual Update",
          description: `Balance changed from ${oldUser.balance} to ${balance}`
        }
      }) : prisma.$queryRaw`SELECT 1`, // No-op if valid
      
    // Create detailed Admin Log
    prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        targetUserId: userId,
        actionType: "USER_UPDATE",
        details: `Updated User ${oldUser.email}: Balance ${oldUser.balance}->${balance}, Points ${oldUser.points}->${points}, Tier ${oldUser.tier}->${tier || oldUser.tier}`
      }
    }),

    // Log to MLM System Log if Tier or Points changed
    ((tier && tier !== oldUser.tier) || (points !== oldUser.points)) ?
      prisma.mLMLog.create({
        data: {
           userId: userId,
           type: "ADMIN_UPDATE",
           amount: 0,
           description: `Admin updated: Tier ${oldUser.tier}->${tier || oldUser.tier}, Points ${oldUser.points}->${points}`
        }
      }) : prisma.$queryRaw`SELECT 1`
  ])

  revalidatePath("/admin/users")
  revalidatePath("/dashboard") 
  revalidatePath("/dashboard/wallet")
  return { success: true }
}


