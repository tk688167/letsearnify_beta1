import { Metadata } from "next"
import StoriesPageContent from "../../components/pages/StoriesPageContent"

export const metadata: Metadata = {
  title: "Success Stories & User Reviews",
  description: "Read real stories from our global community of earners. See how LetsEarnify is making a difference.",
  alternates: {
    canonical: 'https://www.letsearnify.com/stories',
  }
}

export default function StoriesPage() {
  return <StoriesPageContent />
}
