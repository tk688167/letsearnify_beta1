import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/'], // Protect private routes
    },
    sitemap: 'https://www.letsearnify.com/sitemap.xml',
  }
}
