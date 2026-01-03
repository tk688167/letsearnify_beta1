import { prisma } from "@/lib/prisma"
import { subDays, format, startOfDay, endOfDay } from "date-fns"

export async function getAnalytics(range: '7d' | '30d' | '90d' = '7d') {
  const dayCount = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const startDate = subDays(new Date(), dayCount)

  // -- Overview Stats --
  const totalVisits = await prisma.visit.count()
  const uniqueVisitors = await prisma.visit.groupBy({
    by: ['ip'],
    _count: true
  }).then(res => res.length)
  
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } })
  const activeSessions = await prisma.visit.groupBy({
      by: ['sessionId'],
      where: { createdAt: { gte: subDays(new Date(), 1) } }, // Active in last 24h
      _count: true
  }).then(res => res.length)

  // -- Traffic Graph Data --
  const visits = await prisma.visit.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true }
  })

  // Group by date
  const chartMap = new Map<string, number>()
  for (let i = dayCount - 1; i >= 0; i--) {
     const d = subDays(new Date(), i)
     const key = format(d, 'MMM dd') // e.g. "Jan 01"
     chartMap.set(key, 0)
  }
  
  visits.forEach(v => {
     const key = format(v.createdAt, 'MMM dd')
     if (chartMap.has(key)) {
        chartMap.set(key, (chartMap.get(key) || 0) + 1)
     }
  })
  
  const trafficData = Array.from(chartMap).map(([name, visits]) => ({ name, visits }))

  // -- Device & Browser Stats --
  const deviceStats = await prisma.visit.groupBy({
     by: ['device'],
     _count: { device: true },
     orderBy: { _count: { device: 'desc' } }
  })
  
  const browserStats = await prisma.visit.groupBy({
     by: ['browser'],
     _count: { browser: true },
     orderBy: { _count: { browser: 'desc' } }
  })

  // -- Geo Stats (Top Countries) --
  const countryStats = await prisma.visit.groupBy({
      by: ['country'],
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 5
  })

  // -- Recent Activity Feed --
  const recentActivity = await prisma.visit.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          path: true,
          country: true,
          city: true,
          device: true,
          createdAt: true,
          os: true,
          browser: true,
          ip: true
      }
  })

  return {
    overview: {
       totalVisits,
       uniqueVisitors,
       totalSignups: totalUsers,
       activeSessions,
       conversionRate: totalVisits > 0 ? ((totalUsers / totalVisits) * 100).toFixed(1) : 0
    },
    trafficData,
    deployment: {
       devices: deviceStats.map(s => ({ name: s.device || "Unknown", value: s._count.device })),
       browsers: browserStats.map(s => ({ name: s.browser || "Unknown", value: s._count.browser })),
       countries: countryStats.map(s => ({ name: s.country || "Unknown", value: s._count.country }))
    },
    recentActivity: recentActivity.map(a => ({
        ...a,
        time: format(a.createdAt, 'HH:mm:ss')
    }))
  }
}
