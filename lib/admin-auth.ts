import { dbQuery } from "./db"

/**
 * Server-side only: Check if request is from authenticated admin using session token from database
 * Returns true if authorized, false otherwise
 * 
 * DO NOT IMPORT THIS IN CLIENT COMPONENTS - it uses pg module which is server-only
 */
export async function isAdminAuthorized(request: Request): Promise<boolean> {
  try {
    // Check for session token in headers
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return false
    }

    const token = authHeader.slice(7)
    
    if (!token) {
      return false
    }

    // Verify token in database
    const sessionResult = await dbQuery(
      `
      SELECT s.id, s.expires_at, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1
    `,
      [token]
    )

    if (sessionResult.rows.length === 0) {
      return false
    }

    const session = sessionResult.rows[0]

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await dbQuery("DELETE FROM sessions WHERE id = $1", [session.id])
      return false
    }

    // Check if user is admin
    return session.role === "admin"
  } catch (error) {
    console.error("[AUTH] Error verifying token:", error)
    return false
  }
}
