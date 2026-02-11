"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { verifyTronTransaction, base58ToHex } from "./tron"

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
  
  // Handle Profile Picture
  const image = formData.get("image") as string
  if (image) {
      if (image === "REMOVE") {
          data.image = null // remove image from DB
      } else if (image.startsWith("data:image")) {
          data.image = image
      }
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
        
        if (details.network === "TRC20") {
            // Check for reuse first
            const existingTx = await prisma.transaction.findFirst({
                where: { txId: details.txHash }
            });
            if (existingTx) throw new Error("This Transaction Hash has already been used.");

            const verification = await verifyTronTransaction(details.txHash);
            
            if (!verification.success) {
                // If verification failed but network is valid, it might be a user error or pending.
                // We will throw error to stop the deposit.
                throw new Error(`Verification Failed: ${verification.error}. Please check TXID.`);
            }

            // Verify Amount
            // Tolerance of 0.5 USDT to account for potential precision issues or small fees deducted?
            // Usually exact matches for USDT.
            if (Math.abs(verification.amount! - amount) > 0.5) {
                throw new Error(`Amount Mismatch: Blockchain says ${verification.amount}, you entered ${amount}.`);
            }

            // Verify Destination Address
            const platformWallet = await prisma.platformWallet.findUnique({
                where: { network: "TRC20" }
            });

            if (!platformWallet) {
                throw new Error("System Error: Platform TRC20 Wallet not configured. Please contact support.");
            }
            
            // Limit to USDT Contract Only
            // USDT Mainnet Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
            const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
            const usdtHex = base58ToHex(USDT_CONTRACT);
            
            // verification.token is the contract address in Hex from the transaction
            if (verification.token && usdtHex) {
                 if (verification.token.toLowerCase() !== usdtHex.toLowerCase()) {
                     throw new Error(`Invalid Token: We only accept USDT (${USDT_CONTRACT}). You sent a different token.`);
                 }
            } else if (!verification.token && verification.amount) {
                 // If no token is present, it might be TRX transfer? 
                 // My verification logic sets token="TRX" for TransferContract.
                 // If we strictly want USDT, we reject TRX.
                 throw new Error("Invalid Token: We only accept USDT Key transactions. You sent TRX or unknown token.");
            }

            const expectedHex = base58ToHex(platformWallet.address); 
            // verification.toAddress is Hex provided by API.
            if (expectedHex && verification.toAddress) {
                if (verification.toAddress.toLowerCase() !== expectedHex.toLowerCase()) {
                    throw new Error("Invalid Receiver Address: funds were not sent to our wallet.");
                }
            }
        } else {
             throw new Error("Only TRC20 network is supported for crypto deposits.");
        }

        // 1. Create Transaction Record
        await prisma.transaction.create({
         data: {
           userId: session.user.id,
           amount,
           type: "DEPOSIT",
           status: "PENDING", // Wait for Admin Approval
           method: details.network, // Store just "TRC20" or "BEP20"
           description: `[VERIFIED_TRON_USDT] ${details.txHash}`, // Tag for UI
           txId: details.txHash // Save TXID
         }
       })

    // Remove Automatic Balance Update
    // Admin Approval will handle balance increment.

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/wallet")
    return { success: true, message: "Deposit Verified! Creating Request for Admin Approval..." }
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

  // 1. Swap Validation (Input `amount` is ARN)
  const arnAmount = amount;
  if (user.arnBalance < arnAmount) {
      throw new Error(`Insufficient ARN Tokens. You have ${user.arnBalance.toFixed(2)} ARN.`)
  }

  // 2. Conversion to USD
  const usdValue = arnAmount / 10; // 10 ARN = 1 USD
  
  // 3. Minimum Withdrawal in USD
  const minWithdrawalUSD = 10.00; // Example min withdrawal $10
  if (usdValue < minWithdrawalUSD) {
       throw new Error(`Minimum withdrawal is $${minWithdrawalUSD} (${minWithdrawalUSD * 10} ARN).`)
  }

  // 4. 24h Cooldown Check
  const lastWithdrawal = await prisma.transaction.findFirst({
      where: {
          userId: session.user.id,
          type: "WITHDRAWAL"
      },
      orderBy: { createdAt: 'desc' }
  });

  if (lastWithdrawal) {
      const hoursSinceLast = (Date.now() - lastWithdrawal.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
          const hoursRemaining = (24 - hoursSinceLast).toFixed(1);
          throw new Error(`Withdrawal limit: Once every 24 hours. Try again in ${hoursRemaining} hours.`);
      }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { 
          arnBalance: { decrement: arnAmount } 
          // No change to USD balance, as we default to ARN economy. 
          // If we wanted to "Swap" to USD balance first, we would increment balance. 
          // But user wants "Withdraw" directly. So we deduct ARN and create a PENDING USD withdrawal.
      }
    }),
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: usdValue, // Record in USD for Admin Payout
        type: "WITHDRAWAL",
        status: "PENDING", 
        method: `${method} - ${details}`,
        description: `Swapped ${arnAmount} ARN`
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
      // Seed initial data if missing (createMany not supported in SQLite)
      const data = [
          { network: "TRC20", address: "T9y...Placeholder...TRC20", qrCodePath: "/qr-trc20.png" }
      ];
      for (const item of data) {
        await prisma.platformWallet.create({ data: item });
      }
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

import { checkTierUpgrade } from "./mlm"
import { processCbspContribution } from "@/lib/cbsp"

export async function updateUserAsAdmin(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const userId = formData.get("userId") as string
  const balanceRaw = formData.get("balance") as string
  const arnRaw = formData.get("arnBalance") as string
  const activeMembersRaw = formData.get("activeMembers") as string
  const tier = formData.get("tier") as string 
  
  if (!userId) throw new Error("User ID required")

  const balance = balanceRaw ? parseFloat(balanceRaw) : 0
  if (isNaN(balance)) throw new Error("Invalid balance")
  if (balance < 0) throw new Error("Balance cannot be negative")
  
  let arnBalance = arnRaw ? parseFloat(arnRaw) : 0;
  const activeMembers = activeMembersRaw ? parseInt(activeMembersRaw) : 0;
  
  const oldUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!oldUser) throw new Error("User not found");

  const updates: any = {
    balance,
    arnBalance,
    activeMembers
  };
  
  if (tier) {
    updates.tier = tier as any; 
  }

  if (balance >= 1.0) {
     updates.isActiveMember = true;
  }

  const diff = balance - oldUser.balance;

  // Auto-Credit ARN for USD Deposits (1 USD = 10 ARN)
  if (diff > 0) {
      arnBalance += (diff * 10);
      updates.arnBalance = arnBalance; // Update the value to be saved
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update User
    await tx.user.update({
      where: { id: userId },
      data: {
        ...updates,
        ...(diff > 0 ? { totalDeposit: { increment: diff } } : {})
      }
    })
    
    // 2. Create Transaction Record
    if (Math.abs(diff) > 0.001) {
      await tx.transaction.create({
        data: {
          userId,
          amount: Math.abs(diff),
          type: diff > 0 ? "DEPOSIT" : "ADMIN_ADJUSTMENT",
          status: "COMPLETED",
          method: diff > 0 ? "Admin Credit" : "Admin Panel Manual Update",
          description: diff > 0 
            ? `Admin Credited $${diff.toFixed(2)}` 
            : `Balance changed from ${oldUser.balance} to ${balance}`
        }
      })
    }
      
    // 3. Admin Log
    await tx.adminLog.create({
      data: {
        adminId: session.user.id!,
        targetUserId: userId,
        actionType: "USER_UPDATE",
        details: `Updated User ${oldUser.email}: Balance ${oldUser.balance}->${balance}, ARN ${oldUser.arnBalance}->${arnBalance}, Members ${oldUser.activeMembers}->${activeMembers}, Tier ${oldUser.tier}->${tier || oldUser.tier}`
      }
    })

    // 4. CBSP Contribution for Admin Added Funds
    if (diff > 0) {
        // @ts-ignore
        await processCbspContribution(userId, diff, undefined, "Admin Panel Manual Update", tx)
    }

    // 5. MLM Log
    if ((tier && tier !== oldUser.tier) || (arnBalance !== oldUser.arnBalance) || (activeMembers !== oldUser.activeMembers)) {
      await tx.mLMLog.create({
        data: {
           userId: userId,
           type: "ADMIN_UPDATE",
           amount: 0,
           description: `Admin updated: Tier ${oldUser.tier}->${tier || oldUser.tier}, ARN ${oldUser.arnBalance}->${arnBalance}, Members ${oldUser.activeMembers}->${activeMembers}`
        }
      })
    }
  })
  
  // Trigger Tier Check after update
  await checkTierUpgrade(userId);

  revalidatePath("/admin/users")
  revalidatePath("/dashboard") 
  revalidatePath("/dashboard/wallet")
  return { success: true }
}


