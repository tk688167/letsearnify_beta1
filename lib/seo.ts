import { Metadata } from 'next'

// 1. Breadcrumb Generator
export function generateBreadcrumbSchema(items: { name: string, item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.letsearnify.com${item.item}`,
    })),
  }
}

// 2. Page Specific Metadata
export const SEOMetadata = {
  landing: {
    title: "LetsEarnify (LADS) - The #1 Platform to Earn Online Rewards",
    description: "Start earning real money today with LADS. Complete micro-tasks, refer friends, and join our ethical investment pools. Trusted, transparent payouts.",
  },
  about: {
    title: "About LetsEarnify (LADS) - Our Mission & Vision",
    description: "Learn how LetsEarnify (LADS) is bridging the trust gap in the online earning space with transparent, verifiable blockchain payouts.",
  },
  welcome: {
     title: "You're Invited to Join LADS - Claim Your Rewards",
     description: "You have been specially invited to the LetsEarnify (LADS) community. Sign up now to start earning rewards immediately.",
  }
}
