import { NextResponse, NextRequest } from "next/server"
import { dbQuery } from "@/lib/db"
import { isAdminAuthorized } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { rows } = await dbQuery("SELECT * FROM contact_messages ORDER BY created_at DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[API /contact GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate input
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 })
    }

    const { rows } = await dbQuery(
      "INSERT INTO contact_messages (name, email, message) VALUES ($1,$2,$3) RETURNING id",
      [name.trim(), email.trim(), message.trim()],
    )
    return NextResponse.json({ success: true, id: rows[0].id })
  } catch (error) {
    console.error("Error in contact API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, is_read } = body
    await dbQuery("UPDATE contact_messages SET is_read=$1 WHERE id=$2", [!!is_read, id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    await dbQuery("DELETE FROM contact_messages WHERE id=$1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
