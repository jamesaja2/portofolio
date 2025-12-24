import { NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"
import { isAdminAuthorized } from "@/lib/admin-auth"

// GET - Get all mailing list entries (admin only)
export async function GET(req: Request) {
  try {
    const isAdmin = await isAdminAuthorized(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rows } = await dbQuery<{
      id: string
      name: string
      email: string
      phone: string | null
      created_at: string
      status: string
    }>("SELECT * FROM mailing_list ORDER BY created_at DESC", [])

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching mailing list:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch mailing list" }, { status: 500 })
  }
}

// POST - Add new subscriber (public)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email already exists
    const { rows: existing } = await dbQuery<{ id: string }>(
      "SELECT id FROM mailing_list WHERE email = $1",
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 400 })
    }

    const { rows } = await dbQuery<{
      id: string
      name: string
      email: string
      phone: string | null
      created_at: string
      status: string
    }>(
      "INSERT INTO mailing_list (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone || null]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error: any) {
    console.error("Error adding to mailing list:", error)
    return NextResponse.json({ error: error.message || "Failed to add to mailing list" }, { status: 500 })
  }
}

// DELETE - Remove subscriber (admin only)
export async function DELETE(req: Request) {
  try {
    const isAdmin = await isAdminAuthorized(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await dbQuery("DELETE FROM mailing_list WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting from mailing list:", error)
    return NextResponse.json({ error: error.message || "Failed to delete from mailing list" }, { status: 500 })
  }
}
