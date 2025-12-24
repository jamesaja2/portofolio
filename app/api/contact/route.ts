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

    // Send email notifications
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

        const adminEmail = "jamestimothyaja@gmail.com"

        // 1. Email to admin with form details
        await transporter.sendMail({
          from: `"Portfolio Contact Form" <${smtp.username}>`,
          to: adminEmail,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">📬 New Contact Form Submission</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>👤 Name:</strong><br/>${name}</p>
                <p><strong>📧 Email:</strong><br/><a href="mailto:${email}">${email}</a></p>
                <p><strong>💬 Message:</strong><br/>${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Submitted at: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })}
              </p>
            </div>
          `,
        })

        // 2. Auto-reply to visitor with custom template
        await transporter.sendMail({
          from: `"James Timothy" <${smtp.username}>`,
          to: email,
          subject: `Thank you for contacting me | Terima kasih telah menghubungi saya`,
          html: `
<div style="
  background: repeating-linear-gradient(
    45deg,
    #e6f3ff,
    #e6f3ff 12px,
    #ffffff 12px,
    #ffffff 24px
  );
  padding: 24px;
  font-family: Verdana, Arial, sans-serif;
  color: #222;
">

  <div style="
    max-width: 600px;
    margin: auto;
    background: #ffffff;
    border: 3px solid #000000;
    box-shadow: 6px 6px 0 #000000;
    padding: 20px;
  ">

    <!-- SUMMARY OF SUBMISSION -->
    <div style="
      background: #f0f9ff;
      border: 2px solid #3b82f6;
      padding: 15px;
      margin-bottom: 20px;
    ">
      <p style="margin: 0 0 10px 0;"><strong>📋 Your Message Summary:</strong></p>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Message:</strong><br/>${message.replace(/\n/g, "<br>")}</p>
    </div>

    <hr style="border: none; border-top: 3px dashed #999999; margin: 24px 0;">

    <!-- ENGLISH -->
    <p><strong>Hello ${name},</strong></p>

    <p>
      Thank you for contacting me via email.<br>
      Please note that I do not regularly check this email address,
      so responses here may be delayed.
    </p>

    <p><strong>For a faster response, please contact me via WhatsApp:</strong></p>

    <a href="https://wa.me/6285816076778" target="_blank" style="
      display: inline-block;
      background: #25D366;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 18px;
      font-weight: bold;
      border: 3px solid #128C7E;
      box-shadow: 4px 4px 0 #000000;
      margin-top: 8px;
    ">
      📱 Contact via WhatsApp
    </a>

    <p style="margin-top: 18px;">
      Thank you for your understanding.
    </p>

    <hr style="border: none; border-top: 3px dashed #999999; margin: 24px 0;">

    <!-- INDONESIAN -->
    <p><strong>Halo ${name},</strong></p>

    <p>
      Terima kasih telah menghubungi saya melalui email.<br>
      Perlu diketahui bahwa saya jarang membuka email ini,
      sehingga balasan mungkin tidak dapat diberikan dengan cepat.
    </p>

    <p><strong>Untuk respon yang lebih cepat, silakan hubungi saya melalui WhatsApp:</strong></p>

    <a href="https://wa.me/6285816076778" target="_blank" style="
      display: inline-block;
      background: #25D366;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 18px;
      font-weight: bold;
      border: 3px solid #128C7E;
      box-shadow: 4px 4px 0 #000000;
      margin-top: 8px;
    ">
      📱 Hubungi via WhatsApp
    </a>

    <p style="margin-top: 18px;">
      Terima kasih atas pengertiannya.
    </p>

    <p style="margin-top: 24px; font-size: 13px;">
      <strong>James Timothy</strong><br>
      Auto Reply
    </p>

  </div>
</div>
          `,
        })

        console.log("Contact form emails sent: admin notification + visitor auto-reply")
      }
    } catch (emailError) {
      // Log email error but don't fail the contact form submission
      console.error("Failed to send email notifications:", emailError)
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
