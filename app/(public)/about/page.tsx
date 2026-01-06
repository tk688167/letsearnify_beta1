import { Metadata } from "next"
import AboutPageContent from "../../components/pages/AboutPageContent"

export const metadata: Metadata = {
  title: "About LetsEarnify - Our Mission & Vision",
  description: "Learn about LetsEarnify, a platform dedicated to financial freedom through ethical earning, freelancing, and community rewards.",
  alternates: {
    canonical: 'https://www.letsearnify.com/about',
  }
}

export default function AboutPage() {
  return <AboutPageContent />
}
