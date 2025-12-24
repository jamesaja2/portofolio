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

    // Delete session from database
    await dbQuery("DELETE FROM sessions WHERE token = $1", [token])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[LOGOUT] Error:", err)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
