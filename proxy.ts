import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rateLimitMap = new Map();

export async function proxy(req: NextRequest) {
  const { nextUrl } = req

  // ─────────────────────────────────────────────────────────────
  // 0. SKIP heavy processing for NextAuth callback routes
  //    These are Google OAuth redirects — don't interfere with them
  // ─────────────────────────────────────────────────────────────
  if (nextUrl.pathname.startsWith("/api/auth")) {
    // Still run NextAuth session logic for auth routes
    const session = await NextAuth(authConfig).auth(req as any)
    return NextResponse.next()
  }
  
  // ─────────────────────────────────────────────────────────────
  // 1. SECURITY HEADERS
  // ─────────────────────────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://* http://*;
    font-src 'self' data:;
    connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://accounts.google.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // ─────────────────────────────────────────────────────────────
  // 2. RATE LIMITING
  // ─────────────────────────────────────────────────────────────
  if (nextUrl.pathname.startsWith("/api/admin")) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      const limit = 100
      const windowMs = 60 * 1000
      
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

  // ─────────────────────────────────────────────────────────────
  // 3. AUTHENTICATION
  // ─────────────────────────────────────────────────────────────
  const session = await NextAuth(authConfig).auth(req as any)

  if (nextUrl.pathname === "/" && session?.user) {
      const role = (session.user as any)?.role
      return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", nextUrl))
  }

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
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - public folder images
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
