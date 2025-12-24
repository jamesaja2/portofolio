import { NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"

export const dynamic = "force-dynamic"

// API endpoint khusus untuk AI context - berisi semua data portfolio
export async function GET() {
  try {
    // Ambil semua data dari database
    const [aboutData, projectsData, skillsData, experienceData] = await Promise.all([
      dbQuery("SELECT name, title, description, avatar_url FROM about ORDER BY created_at DESC LIMIT 1"),
      dbQuery(`
        SELECT 
          p.id, p.title, p.description, p.project_url, p.stack, p.image_url,
          COALESCE(
            json_agg(
              json_build_object('name', s.name, 'logo_url', s.logo_url)
              ORDER BY s.name
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'::json
          ) as skills
        FROM projects p
        LEFT JOIN LATERAL unnest(p.skill_ids) WITH ORDINALITY AS skill_id(id, ord) ON true
        LEFT JOIN skills s ON s.id = skill_id.id
        GROUP BY p.id, p.title, p.description, p.project_url, p.stack, p.image_url, p.created_at
        ORDER BY p.created_at DESC
      `),
      dbQuery("SELECT id, name, logo_url FROM skills ORDER BY name"),
      dbQuery(`
        SELECT id, company, role, description, start_date, end_date, is_current
        FROM experience 
        ORDER BY created_at DESC
      `),
    ])

    const about = aboutData.rows[0] || { name: "", title: "", description: "" }
    const projects = projectsData.rows
    const skills = skillsData.rows
    const experience = experienceData.rows

    // Format data untuk AI context
    const context = {
      owner: {
        name: about.name || "Portfolio Owner",
        role: about.title || "Developer",
      },
      about: {
        title: about.title,
        description: about.description,
      },
      projects: projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: [
          ...p.skills.map((s: any) => s.name),
          ...(p.stack ? (Array.isArray(p.stack) ? p.stack : []) : []),
        ].filter(Boolean),
        url: p.project_url,
        image: p.image_url,
      })),
      skills: skills.map((s) => s.name),
      experience: experience.map((e) => ({
        company: e.company,
        role: e.role,
        period: e.is_current 
          ? `${e.start_date} - Present` 
          : `${e.start_date} - ${e.end_date || 'Present'}`,
        description: e.description,
      })),
      metadata: {
        websiteType: "Interactive Portfolio with Habbo Hotel style multiplayer chatroom",
        features: [
          "Multiplayer isometric chatroom",
          "Interactive portfolio modals",
          "Mini games (Memory, Rock Paper Scissors, Tech Trivia)",
          "Contact form",
          "Newsletter subscription",
        ],
      },
    }

    return NextResponse.json(context)
  } catch (error) {
    console.error("Error fetching AI context:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio context" },
      { status: 500 }
    )
  }
}
