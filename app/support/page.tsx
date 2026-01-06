import { Metadata } from "next"
import SupportPageContent from "../components/pages/SupportPageContent"

export const metadata: Metadata = {
  title: "Contact LetsEarnify Support Team",
  description: "Get help with your account, payments, or verification. Our support team is here to assist you 24/7.",
  alternates: {
    canonical: 'https://www.letsearnify.com/support',
  }
}

export default function SupportPage() {
  return <SupportPageContent />
}
