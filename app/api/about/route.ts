import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { dbQuery } from "@/lib/db"

export async function GET() {
  try {
    const { rows } = await dbQuery("SELECT * FROM about ORDER BY updated_at DESC LIMIT 1")
    if (rows.length === 0) return NextResponse.json(null)
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /about GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch about" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, title, description, avatar_url } = body
    if (id) {
      const { rows } = await dbQuery(
        "UPDATE about SET name=$1, title=$2, description=$3, avatar_url=$4, updated_at=NOW() WHERE id=$5 RETURNING *",
        [name, title, description, avatar_url || null, id],
      )
      return NextResponse.json(rows[0])
    } else {
      const { rows } = await dbQuery(
        "INSERT INTO about (name, title, description, avatar_url) VALUES ($1,$2,$3,$4) RETURNING *",
        [name, title, description, avatar_url || null],
      )
      return NextResponse.json(rows[0])
    }
  } catch (error) {
    console.error("[API /about PUT] DB error:", error)
    return NextResponse.json({ error: "Failed to upsert about" }, { status: 500 })
  }
}
