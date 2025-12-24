import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { isAdminAuthorized } from "@/lib/admin-auth"
import { dbQuery } from "@/lib/db"

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function withPreview(html: string, previewText?: string) {
  if (!previewText) return html
  return `
    <span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">${previewText}</span>
    ${html}
  `
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthorized(request)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { subject, html, previewText, mode, testEmail } = body ?? {}

  if (!subject || !html || (mode !== "test" && mode !== "all")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (mode === "test" && !testEmail) {
    return NextResponse.json({ error: "Email uji coba wajib diisi" }, { status: 400 })
  }

  const { rows } = await dbQuery<{
    host: string
    port: number
    username: string
    password: string
    from_email: string
    from_name: string
    secure: boolean
  }>("SELECT host, port, username, password, from_email, from_name, secure FROM smtp_settings ORDER BY updated_at DESC LIMIT 1")

  if (!rows.length) {
    return NextResponse.json({ error: "SMTP belum dikonfigurasi" }, { status: 400 })
  }

  const smtp = rows[0]

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  })

  let recipients: string[] = []

  if (mode === "test") {
    recipients = [String(testEmail)]
  } else {
    const mailingList = await dbQuery<{ email: string }>(
      "SELECT email FROM mailing_list WHERE status = 'subscribed' ORDER BY created_at ASC",
    )
    recipients = mailingList.rows.map((row) => row.email)
    if (!recipients.length) {
      return NextResponse.json({ error: "Tidak ada subscriber aktif" }, { status: 400 })
    }
  }

  const payloadHtml = withPreview(String(html), previewText ? String(previewText) : undefined)
  const plainText = stripHtml(payloadHtml)

  const failures: string[] = []

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `${smtp.from_name} <${smtp.from_email}>`,
        to: email,
        subject: String(subject),
        html: payloadHtml,
        text: plainText,
        headers: previewText ? { "X-Preview-Text": previewText } : undefined,
      })
    } catch (error) {
      console.error("Failed to send email", email, error)
      failures.push(email)
    }
  }

  if (failures.length) {
    return NextResponse.json(
      { error: `Gagal mengirim ke ${failures.length} penerima`, failures },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, sent: recipients.length })
}
