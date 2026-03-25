const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function generateMemberId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString()
}

async function main() {
  // Fix users with CUID-style memberIds (longer than 7 digits)
  const allUsers = await p.user.findMany({
    select: { id: true, email: true, memberId: true, referralCode: true }
  })

  let fixedMemberId = 0
  let fixedReferralCode = 0

  for (const user of allUsers) {
    const updates = {}

    // Fix memberId if it looks like a CUID (contains letters or too long)
    if (user.memberId && (user.memberId.length > 7 || /[a-z]/i.test(user.memberId))) {
      updates.memberId = generateMemberId()
      fixedMemberId++
    }

    // Fix missing referralCode
    if (!user.referralCode) {
      updates.referralCode = generateReferralCode()
      fixedReferralCode++
    }

    if (Object.keys(updates).length > 0) {
      try {
        await p.user.update({ where: { id: user.id }, data: updates })
        console.log(`Fixed ${user.email}: ${JSON.stringify(updates)}`)
      } catch (err) {
        // Retry with different values on collision
        if (updates.memberId) updates.memberId = generateMemberId()
        if (updates.referralCode) updates.referralCode = generateReferralCode()
        try {
          await p.user.update({ where: { id: user.id }, data: updates })
          console.log(`Fixed (retry) ${user.email}: ${JSON.stringify(updates)}`)
        } catch (e) {
          console.error(`FAILED to fix ${user.email}:`, e.message)
        }
      }
    }
  }

  console.log(`\nDone! Fixed ${fixedMemberId} memberIds, ${fixedReferralCode} referralCodes`)
  await p.$disconnect()
}

main()