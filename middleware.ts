import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 1. Rate Limiting Map (Basic In-Memory for single instance/demo)
// For robust prod scale, use Redis/Upstash
const rateLimitMap = new Map();

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // -------------------------------------------------------------------------
  // 1. SECURITY HEADERS (OWASP Recommendations)
  // -------------------------------------------------------------------------
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  // Allow scripts from self and trusted sources (Stripe, etc. if needed)
  // 'unsafe-inline' and 'unsafe-eval' often needed for Next.js dev/production hydration in some versions or 3rd party libs
  // Using nonce is best practice.
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://* http://*;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // -------------------------------------------------------------------------
  // 2. RATE LIMITING (Basic)
  // -------------------------------------------------------------------------
  if (nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/api/admin")) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      const limit = 100 // Requests per window
      const windowMs = 60 * 1000 // 1 minute
      
      const key = `${ip}:${nextUrl.pathname}`
      const current = rateLimitMap.get(key) || { count: 0, startTime: Date.now() }
      
      if (Date.now() - current.startTime > windowMs) {
          current.count = 1
          current.startTime = Date.now()
      } else {
          current.count++
      }
      
      rateLimitMap.set(key, current)
      
      if (current.count > limit) {
          return new NextResponse(JSON.stringify({ error: "Too many requests" }), { 
              status: 429, 
              headers: { 'Content-Type': 'application/json' } 
           })
      }
  }

  // -------------------------------------------------------------------------
  // 3. AUTHENTICATION (NextAuth)
  // -------------------------------------------------------------------------
  // Run NextAuth with modified headers
  const session = await NextAuth(authConfig).auth(req as any)

  // Redirect authenticated users from Home to Dashboard
  if (nextUrl.pathname === "/" && session?.user) {
      return NextResponse.redirect(new URL("/dashboard/welcome", nextUrl))
  }



  // NOTE: NextAuth middleware usually handles redirect protection based on authConfig.
  // We can add custom Role checks here if needed, but usually done in component/api.
  
  // Return response with headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)', '/api/auth/:path*', '/api/admin/:path*'],
}
