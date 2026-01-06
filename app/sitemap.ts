import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.letsearnify.com'
  
  // Static Routes
  const routes = [
    '',
    '/about',
    '/features',
    '/support',
    '/terms',
    '/security',
    '/stories',
    '/proofs',
    '/welcome', // Public referral landing
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
