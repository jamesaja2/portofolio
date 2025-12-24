import { NextResponse, NextRequest } from "next/server"
import { dbQuery } from "@/lib/db"
import { isAdminAuthorized } from "@/lib/admin-auth"
import nodemailer from "nodemailer"

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

    // Send email notification to admin
    try {
      const smtpResult = await dbQuery("SELECT * FROM smtp_settings ORDER BY created_at DESC LIMIT 1")
      if (smtpResult.rows.length > 0) {
        const smtp = smtpResult.rows[0]
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: {
            user: smtp.username,
            pass: smtp.password,
          },
        })

        // Get admin email from environment or database
        const adminEmail = process.env.ADMIN_EMAIL || smtp.username

        await transporter.sendMail({
          from: `"Portfolio Contact Form" <${smtp.username}>`,
          to: adminEmail,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
            <hr>
            <p><small>Sent from your portfolio contact form</small></p>
          `,
        })

        console.log("Contact form notification email sent successfully")
      }
    } catch (emailError) {
      // Log email error but don't fail the contact form submission
      console.error("Failed to send email notification:", emailError)
    }

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
