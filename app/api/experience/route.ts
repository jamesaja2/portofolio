import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { dbQuery } from "@/lib/db"

export async function GET() {
  try {
    const { rows } = await dbQuery("SELECT * FROM experience ORDER BY sort_order ASC, created_at ASC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[API /experience GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { company, role, description, start_date, end_date, is_current, sort_order } = body
    const { rows } = await dbQuery(
      "INSERT INTO experience (company, role, description, start_date, end_date, is_current, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [company, role, description || null, start_date, end_date || null, !!is_current, sort_order || 0],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /experience POST] DB error:", error)
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, company, role, description, start_date, end_date, is_current, sort_order } = body
    const { rows } = await dbQuery(
      "UPDATE experience SET company=$1, role=$2, description=$3, start_date=$4, end_date=$5, is_current=$6, sort_order=$7 WHERE id=$8 RETURNING *",
      [company, role, description || null, start_date, end_date || null, !!is_current, sort_order || 0, id],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /experience PUT] DB error:", error)
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 })
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

    await dbQuery("DELETE FROM experience WHERE id=$1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /experience DELETE] DB error:", error)
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 })
  }
}
