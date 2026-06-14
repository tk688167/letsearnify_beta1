import { Metadata } from 'next'
import PoolsPageContent from '@/app/components/pages/PoolsPageContent'

export const metadata: Metadata = {
  title: 'Reward Pools | Let\'sEarnify',
  description: 'Explore our automated reward pools (CBSP, Royalty, Achievement) designed to distribute platform revenue fairly and transparently to all active Let\'sEarnify members.',
  alternates: {
    canonical: 'https://letsearnify.com/pools'
  }
}

export default function PoolsPage() {
  return <PoolsPageContent />
}
