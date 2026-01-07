import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    // Admin Check
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim() || ""
    const page = parseInt(searchParams.get('page') || "1")
    const limit = parseInt(searchParams.get('limit') || "2000")
    const skip = (page - 1) * limit

    console.log(`[ADMIN_SEARCH] Admin ${session.user.email} searching for: "${query}"`)

    let whereClause: any = {}
    
    // Pre-calculate numeric part for ID matching
    let numericPart = ""
    if (query) {
        numericPart = query.replace(/^LEU-/i, '')
    }
    const isMemberIdQuery = query && !isNaN(parseInt(numericPart))

    if (query) {
      if (isMemberIdQuery) {
        whereClause = {
          OR: [
             { memberId: parseInt(numericPart) },
             { name: { contains: query, mode: 'insensitive' } },
             { email: { contains: query, mode: 'insensitive' } },
          ]
        }
      } else {
        whereClause = {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ]
        }
      }
    }

    // If query exists, we want to fetch more results to perform custom ranking in-memory
    // If no query, we just use standard db pagination
    
    if (query) {
       // Fetch a larger set to sort accurately (cap at 2000 for performance safety)
       const allMatches = await prisma.user.findMany({
         where: whereClause,
         take: 2000,
         select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          balance: true,
          tier: true,
          points: true,
          activeMembers: true,
          memberId: true
        }
       })

       // Custom Ranking: Exact > Starts With > Contains
       const lowerQ = query.toLowerCase()
       
       const sorted = allMatches.sort((a, b) => {
          const aName = a.name?.toLowerCase() || ""
          const bName = b.name?.toLowerCase() || ""
          const aEmail = a.email?.toLowerCase() || ""
          const bEmail = b.email?.toLowerCase() || ""
          
          // Exact Match Check
          const aExact = aName === lowerQ || aEmail === lowerQ || (isMemberIdQuery && a.memberId.toString() === numericPart)
          const bExact = bName === lowerQ || bEmail === lowerQ || (isMemberIdQuery && b.memberId.toString() === numericPart)
          
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          
          // Starts With Check
          const aStarts = aName.startsWith(lowerQ) || aEmail.startsWith(lowerQ)
          const bStarts = bName.startsWith(lowerQ) || bEmail.startsWith(lowerQ)
          
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
          
          return 0
       })

       // Return FULL sorted list (No slicing for pagination)
       const total = sorted.length
       // const paginatedUsers = sorted.slice(skip, skip + limit) 

       return NextResponse.json({
         users: sorted, // Return all sorted users
         total,
         page: 1,
         totalPages: 1
       })

    } else {
      // Standard fetch (No Search) - but with high limit for "Full List"
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          // skip,  // Remove skip to visualy see all users if we want 1 huge page or keep it 0 if page is 1
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            balance: true,
            tier: true,
            points: true,
            activeMembers: true,
            memberId: true
          }
        }),
        prisma.user.count()
      ])

      return NextResponse.json({
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

  } catch (error) {
    console.error("[ADMIN_SEARCH_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
