import { Metadata } from 'next'
import HowItWorksPageContent from '@/app/components/pages/HowItWorksPageContent'

export const metadata: Metadata = {
  title: 'How It Works | Let\'sEarnify',
  description: 'Learn step-by-step how the Let\'sEarnify platform ecosystem operates, from registration and deposits to earning passive income and secure withdrawals.',
  alternates: {
    canonical: 'https://letsearnify.com/how-it-works'
  }
}

export default function HowItWorksPage() {
  return <HowItWorksPageContent />
}
