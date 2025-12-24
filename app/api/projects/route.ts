import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { dbQuery } from "@/lib/db"

export async function GET() {
  try {
    const { rows } = await dbQuery(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'name', s.name, 'logo_url', s.logo_url)
            ORDER BY s.sort_order, s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as skills
      FROM projects p
      LEFT JOIN LATERAL unnest(p.skill_ids) WITH ORDINALITY AS skill_id(id, ord) ON true
      LEFT JOIN skills s ON s.id = skill_id.id
      GROUP BY p.id
      ORDER BY p.sort_order ASC, p.created_at ASC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("[API /projects GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const isAdmin = await isAdminAuthorized(request)
    console.log("[API /projects POST] Authorization check:", isAdmin)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, stack, skill_ids, image_url, project_url, sort_order } = body
    const { rows } = await dbQuery(
      "INSERT INTO projects (title, description, stack, skill_ids, image_url, project_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [title, description, stack || [], skill_ids || [], image_url || null, project_url || null, sort_order || 0],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /projects POST] DB error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, stack, skill_ids, image_url, project_url, sort_order } = body
    const { rows } = await dbQuery(
      "UPDATE projects SET title=$1, description=$2, stack=$3, skill_ids=$4, image_url=$5, project_url=$6, sort_order=$7 WHERE id=$8 RETURNING *",
      [title, description, stack || [], skill_ids || [], image_url || null, project_url || null, sort_order || 0, id],
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[API /projects PUT] DB error:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const isAdmin = await isAdminAuthorized(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    await dbQuery("DELETE FROM projects WHERE id=$1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /projects DELETE] DB error:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
