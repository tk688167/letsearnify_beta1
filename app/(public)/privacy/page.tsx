import { Metadata } from "next"
import PrivacyPageContent from "../../components/pages/PrivacyPageContent"

export const metadata: Metadata = {
  title: "Privacy Policy - LetsEarnify",
  description: "Our commitment to protecting your personal data and privacy rights.",
  alternates: {
    canonical: 'https://www.letsearnify.com/privacy',
  }
}

export default function PrivacyPage() {
  return <PrivacyPageContent />
}
