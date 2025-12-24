import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { dbQuery } from "@/lib/db"

export async function GET() {
  try {
    const { rows } = await dbQuery("SELECT * FROM skills ORDER BY sort_order ASC, created_at ASC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[API /skills GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, logo_url, sort_order } = body
    const { rows } = await dbQuery(
      "INSERT INTO skills (name, logo_url, sort_order) VALUES ($1,$2,$3) RETURNING *",
      [name, logo_url || null, sort_order || 0],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /skills POST] DB error:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, logo_url, sort_order } = body
    const { rows } = await dbQuery(
      "UPDATE skills SET name=$1, logo_url=$2, sort_order=$3 WHERE id=$4 RETURNING *",
      [name, logo_url || null, sort_order || 0, id],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /skills PUT] DB error:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    await dbQuery("DELETE FROM skills WHERE id=$1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /skills DELETE] DB error:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}
