import { Metadata } from "next"
import TermsPageContent from "../components/pages/TermsPageContent"

export const metadata: Metadata = {
  title: "Terms, Disclosures & Earnings Disclaimer | LetsEarnify",
  description: "Review our Terms of Service, Risk Disclosures, and Privacy Policy. We believe in 100% transparency for all our members.",
  alternates: {
    canonical: 'https://www.letsearnify.com/terms',
  }
}

export default function TermsPage() {
  return <TermsPageContent />
}
