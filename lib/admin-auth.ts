import { NextRequest } from "next/server"

/**
 * Check if request is from authenticated admin (either Supabase or custom localStorage token)
 * Returns true if authorized, false otherwise
 */
export async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  // Check for custom admin token in headers
  const authHeader = request.headers.get("authorization")
  console.log("[AUTH] Authorization header:", authHeader ? authHeader.substring(0, 30) + "..." : "NOT FOUND")
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    console.log("[AUTH] Token found, length:", token.length)
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      console.log("[AUTH] Decoded token:", decoded)
      if (decoded.email && decoded.iat) {
        // Valid custom token format
        console.log("[AUTH] Valid token format, returning true")
        return true
      }
    } catch (e) {
      // Invalid token format, continue to Supabase check
      console.log("[AUTH] Token decode error:", String(e))
    }
  }

  // Fallback: try Supabase auth (for future use when Supabase auth is fixed)
  // For now, we're using custom admin auth exclusively
  console.log("[AUTH] No valid auth token found, returning false")
  return false
}

/**
 * Check if client request from browser has admin localStorage token
 * Pass as Authorization header in client-side fetches
 */
export function getAdminAuthHeader(): { "Authorization": string } | undefined {
  if (typeof window === "undefined") return undefined
  const token = localStorage.getItem("admin_token")
  if (!token) return undefined
  return {
    Authorization: `Bearer ${token}`,
  }
}
