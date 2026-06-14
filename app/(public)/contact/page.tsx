import { Metadata } from "next"
import ContactPageContent from "../../components/pages/ContactPageContent"

export const metadata: Metadata = {
  title: "Contact Us - LetsEarnify Support",
  description: "Get in touch with the LetsEarnify team. We offer 24/7 support via email, live chat, and our ticketing system.",
  alternates: {
    canonical: 'https://www.letsearnify.com/contact',
  }
}

export default function ContactPage() {
  return <ContactPageContent />
}
