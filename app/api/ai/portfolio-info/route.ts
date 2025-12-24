import { NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Fetch data dari database seperti context API
    const [aboutData, projectsData, skillsData, experienceData] = await Promise.all([
      dbQuery("SELECT name, title, description FROM about ORDER BY created_at DESC LIMIT 1"),
      dbQuery("SELECT title, description, stack FROM projects ORDER BY created_at DESC"),
      dbQuery("SELECT name FROM skills ORDER BY name"),
      dbQuery("SELECT company, role, start_date, end_date, is_current FROM experience ORDER BY start_date DESC"),
    ])

    const about = aboutData.rows[0]
    const projects = projectsData.rows
    const skills = skillsData.rows
    const experience = experienceData.rows

    // Format sebagai text yang compact
    let info = `=== PORTFOLIO INFO ===\n\n`
    
    if (about) {
      info += `ABOUT:\n${about.name} - ${about.title}\n${about.description}\n\n`
    }

    if (skills && skills.length > 0) {
      info += `SKILLS:\n${skills.map(s => s.name).join(", ")}\n\n`
    }

    if (projects && projects.length > 0) {
      info += `PROJECTS:\n`
      projects.forEach((p, i) => {
        info += `${i + 1}. ${p.title}\n   ${p.description}\n   Tech: ${Array.isArray(p.stack) ? p.stack.join(", ") : p.stack}\n\n`
      })
    }

    if (experience && experience.length > 0) {
      info += `EXPERIENCE:\n`
      experience.forEach((e, i) => {
        const period = e.is_current ? `${e.start_date} - Present` : `${e.start_date} - ${e.end_date}`
        info += `${i + 1}. ${e.role} at ${e.company} (${period})\n`
      })
    }

    info += `\n=== END INFO ===`

    return new NextResponse(info, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio info:", error)
    return new NextResponse("Error fetching portfolio info", { status: 500 })
  }
}
