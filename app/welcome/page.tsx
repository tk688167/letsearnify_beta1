import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import WelcomeContent from "./WelcomeContent"
import PublicWelcome from "./PublicWelcome"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Welcome to LetsEarnify - Start Your Journey",
  description: "Join LetsEarnify today! The #1 platform to earn online rewards through micro-tasks and referrals. Safe, trusted payouts and ethical earning pools.",
  alternates: {
    canonical: "https://www.letsearnify.com/welcome",
  },
  openGraph: {
    title: "Welcome to LetsEarnify",
    description: "Start earning real money online with LetsEarnify. Secure, transparent, and rewarding.",
    url: "https://www.letsearnify.com/welcome",
    siteName: "LetsEarnify",
    images: [
      {
        url: "https://www.letsearnify.com/og-image.jpg", // Ensure this exists or use a generic one
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: { 
    index: true, // Changed to true if this is a public landing page
    follow: true 
  }
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()

  // If NOT authenticated, show Public Welcome (Referral Landing)
  if (!session?.user?.id) {
     const ref = typeof searchParams?.ref === 'string' ? searchParams.ref : undefined
     return <PublicWelcome initialRef={ref} />
  }
  
  // If Authenticated, show Internal Welcome Dashboard
  const [user, pools] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          referralCode: true,
          isActiveMember: true,
          // @ts-ignore - Field exists in schema but types may be stale
          isCbspMember: true,
          totalDeposit: true,
          tier: true
        }
      }),
      prisma.pool.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            percentage: true,
            balance: true
        }
      })
  ])

  if (!user) return <PublicWelcome /> // Fallback if user not found

  return <WelcomeContent user={user} pools={pools} />
}
