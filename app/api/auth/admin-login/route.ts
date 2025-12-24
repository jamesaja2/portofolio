import { NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[ADMIN LOGIN] Received request for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Query user from Neon database
    const userResult = await dbQuery("SELECT id, email, password_hash, role FROM users WHERE email = $1", [
      email,
    ])

    if (userResult.rows.length === 0) {
      console.log("[ADMIN LOGIN] User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      console.log("[ADMIN LOGIN] Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate session token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store session in database
    await dbQuery("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [
      user.id,
      token,
      expiresAt,
    ])

    console.log("[ADMIN LOGIN] Success! User:", user.email)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("[ADMIN LOGIN] Error:", err)
    return NextResponse.json({ error: "Auth failed: " + String(err) }, { status: 500 })
  }
}
