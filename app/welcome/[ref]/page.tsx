import PublicWelcome from "../PublicWelcome"
import { Metadata } from "next"

type Props = {
  params: { ref: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // In Next.js 15+, params might be a Promise, but this file is .tsx, likely < 15 logic logic or stable params.
  // Standard App Router: params is accessible.
  
  const refCode = params.ref
  
  return {
    title: `You're Invited by ${refCode} | LetsEarnify`,
    description: `You have been specially invited by ${refCode} to join LetsEarnify. Accept your invite and start earning rewards today.`,
    openGraph: {
        title: `Join ${refCode} on LetsEarnify`,
        description: "Join the revolution and start earning online today.",
    },
    robots: { 
      index: false, // Usually invitation pages are not indexed to avoid duplicate content, but user requested SEO. 
      // Keeping index: false for specific Ref URLs is best practice to avoid massive duplicate content issues, 
      // while the main /welcome page is indexed.
      follow: true 
    }
  }
}

export default function WelcomeRefPage({ params }: Props) {
  return <PublicWelcome initialRef={params.ref} />
}
