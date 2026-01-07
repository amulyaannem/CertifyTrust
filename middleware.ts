import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Add authentication middleware here
  // Check for Firebase auth token in cookies
  const token = request.cookies.get("auth-token")?.value

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
