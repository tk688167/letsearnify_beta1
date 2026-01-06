import { Metadata } from "next"
import ProofsPageContent from "../../components/pages/ProofsPageContent"

export const metadata: Metadata = {
  title: "Payment Proofs & User Testimonials | LetsEarnify",
  description: "See real-time payment proofs and read success stories from LetsEarnify members. Verified payouts via TRC20 and Bank Transfer.",
  alternates: {
    canonical: 'https://www.letsearnify.com/proofs',
  }
}

export default function ProofsPage() {
  return <ProofsPageContent />
}
