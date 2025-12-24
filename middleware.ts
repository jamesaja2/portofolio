import type { NextRequest, NextResponse } from "next/server"

// Simple middleware - no Supabase auth
export async function middleware(request: NextRequest) {
  // Just pass through - auth handled via localStorage on client side
  return
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
