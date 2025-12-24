import { NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    // Query session from database
    const sessionResult = await dbQuery(
      `
      SELECT s.id, s.expires_at, u.id as user_id, u.email, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1
    `,
      [token]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const session = sessionResult.rows[0]

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await dbQuery("DELETE FROM sessions WHERE id = $1", [session.id])
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role,
      },
    })
  } catch (err) {
    console.error("[VERIFY SESSION] Error:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
