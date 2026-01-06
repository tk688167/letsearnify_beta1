import { Metadata } from "next"
import FeaturesPageContent from "../../components/pages/FeaturesPageContent"

export const metadata: Metadata = {
  title: "LetsEarnify Features - Tasks, Freelancing & Pools",
  description: "Explore the powerful features of LetsEarnify. From micro-tasks to the Mudaraba earning pools, discover how you can earn money online.",
  alternates: {
    canonical: 'https://www.letsearnify.com/features',
  }
}

export default function FeaturesPage() {
  return <FeaturesPageContent />
}
