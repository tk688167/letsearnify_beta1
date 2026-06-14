import type { Metadata } from "next"
import CookiesPageContent from "../components/pages/CookiesPageContent"

export const metadata: Metadata = {
  title: "Cookie Policy | LetsEarnify",
  description: "Learn how LetsEarnify uses cookies and similar technologies to improve your experience, ensure security, and track performance.",
}

export default function CookiesPage() {
  return <CookiesPageContent />
}
