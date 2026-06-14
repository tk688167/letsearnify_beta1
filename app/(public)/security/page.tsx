import { Metadata } from "next"
import SecurityPageContent from "../../components/pages/SecurityPageContent"

export const metadata: Metadata = {
  title: "Security Center - Your Safety First",
  description: "Discover how we protect your data and funds with enterprise-grade encryption, secure wallets, and strict privacy policies.",
  alternates: {
    canonical: 'https://www.letsearnify.com/security',
  }
}

export default function SecurityPage() {
  return <SecurityPageContent />
}
