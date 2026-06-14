/**
 * Automatically generates a relevant conversation title based on the user's first message.
 * Follows strict rules for professional SaaS support organization.
 */
export function generateConversationTitle(message: string): string {
  if (!message) return "General Support"

  const msg = message.toLowerCase()

  // 1. Withdrawal Issues
  if (
    msg.includes("withdraw") || 
    msg.includes("withdrawal") || 
    msg.includes("payout") || 
    msg.includes("cash out")
  ) {
    return "Withdrawal Issue"
  }

  // 2. Deposit / Payment Issues
  if (
    msg.includes("deposit") || 
    msg.includes("payment") || 
    msg.includes("add fund") || 
    msg.includes("recharge") ||
    msg.includes("paid")
  ) {
    return "Payment/Deposit Query"
  }

  // 3. Account / Login Issues
  if (
    msg.includes("login") || 
    msg.includes("sign in") || 
    msg.includes("password") || 
    msg.includes("account access") ||
    msg.includes("blocked")
  ) {
    return "Account Access Problem"
  }

  // 4. Fund Transfers
  if (
    msg.includes("transfer") || 
    msg.includes("send money") || 
    msg.includes("wallet to wallet")
  ) {
    return "Fund Transfer Query"
  }

  // 5. Spin / Rewards
  if (
    msg.includes("spin") || 
    msg.includes("reward") || 
    msg.includes("lucky") || 
    msg.includes("bonus")
  ) {
    return "Rewards Inquiry"
  }

  // 6. Tasks / Marketplace
  if (
    msg.includes("task") || 
    msg.includes("gig") || 
    msg.includes("offer")
  ) {
    return "Marketplace/Task Query"
  }

  // 7. Referral / Team
  if (
    msg.includes("referral") || 
    msg.includes("invite") || 
    msg.includes("team") || 
    msg.includes("upline") ||
    msg.includes("downline")
  ) {
    return "Referral/Team Support"
  }

  // Fallback for everything else
  return "General Support"
}
