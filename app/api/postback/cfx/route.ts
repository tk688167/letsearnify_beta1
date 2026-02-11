
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic since searchParams change
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  
  // ------------------------------------------------------------------
  // CFX / CPX RESEARCH POSTBACK HANDLER
  // Expected Params:
  // - uid (or subid_1): The user ID (subid_1)
  // - amount: The reward amount
  // - status: 'completed' (or '1'), 'reversed' (or '2') - varies by network
  // - trans_id: Unique transaction ID
  // - hash: Security hash (optional)
  //
  // SETUP IN DASHBOARD:
  // Set Postback URL to: https://your-domain.com/api/postback/cfx?uid={subid_1}&amount={payout}&status={status}&trans_id={trans_id}
  // ------------------------------------------------------------------

  const userId = searchParams.get("subid_1") || searchParams.get("uid")
  const amount = parseFloat(searchParams.get("amount") || "0")
  const status = searchParams.get("status")
  const transId = searchParams.get("trans_id")

  // 1. Basic Validation
  if (!userId || !status || !transId) {
    return new NextResponse("Missing parameters", { status: 400 })
  }

  // 2. Check User Exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    console.error(`CFX Postback: User not found ${userId}`)
    return new NextResponse("User not found", { status: 404 })
  }

  // 3. Handle Status
  // CFX usually sends 'completed' for successful surveys
  if (status === 'completed') {
    
    // Check if duplicate transaction
    const exists = await prisma.transaction.findFirst({
        where: { txId: transId }
    })
    
    if (exists) {
        return new NextResponse("Duplicate transaction", { status: 200 })
    }

    // DB Transaction: Add ARN Balance + Record Transaction
    // amount is in USD from Postback
    const arnAmount = amount * 10; 

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { 
                arnBalance: { increment: arnAmount }
            }
        }),
        prisma.transaction.create({
            data: {
                userId: userId,
                amount: amount,
                type: "REWARD", // or SURVEY_REWARD
                status: "COMPLETED",
                method: "CFX_RESEARCH",
                description: `Survey Completion (ID: ${transId})`,
                txId: transId
            }
        })
    ])

    console.log(`✅ Credited $${amount} to user ${user.email} for CFX Survey ${transId}`)

  } else if (status === 'reversed') {
      // Handle chargebacks/reversals if needed
      await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } }
      })
      // Log reversal...
      console.log(`⚠️ Reversed $${amount} from user ${user.email}`)
  }

  // Return success to CFX
  return new NextResponse("1", { status: 200 })
}
