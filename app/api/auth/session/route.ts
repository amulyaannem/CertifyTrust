import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token with Firebase Admin SDK
    // This would be implemented with adminAuth.verifyIdToken(token)
    return NextResponse.json({
      authenticated: true,
      token: token,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
