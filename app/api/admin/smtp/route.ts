import { NextRequest, NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"
import { isAdminAuthorized } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthorized(request)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { rows } = await dbQuery<{
    id: string
    host: string
    port: number
    username: string
    from_email: string
    from_name: string
    secure: boolean
    password: string
  }>(
    "SELECT * FROM smtp_settings ORDER BY updated_at DESC LIMIT 1",
    [],
  )

  if (!rows.length) {
    return NextResponse.json(null)
  }

  const record = rows[0]
  return NextResponse.json({
    host: record.host,
    port: record.port,
    username: record.username,
    from_email: record.from_email,
    from_name: record.from_name,
    secure: record.secure,
    hasPassword: Boolean(record.password),
  })
}

export async function PUT(request: NextRequest) {
  const isAdmin = await isAdminAuthorized(request)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { host, port, username, password, fromEmail, fromName, secure } = body ?? {}

  if (!host || !port || !username || !fromEmail || !fromName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const parsedPort = Number(port)
  if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    return NextResponse.json({ error: "Port harus berupa angka 1-65535" }, { status: 400 })
  }

  const { rows } = await dbQuery<{ id: string; password: string | null }>(
    "SELECT id, password FROM smtp_settings ORDER BY updated_at DESC LIMIT 1",
  )

  if (rows.length) {
    const row = rows[0]
    await dbQuery(
      "UPDATE smtp_settings SET host=$1, port=$2, username=$3, password=$4, from_email=$5, from_name=$6, secure=$7 WHERE id=$8",
      [
        host,
        parsedPort,
        username,
        password ? String(password) : row.password,
        fromEmail,
        fromName,
        Boolean(secure),
        row.id,
      ],
    )
  } else {
    if (!password) {
      return NextResponse.json({ error: "Password SMTP wajib diisi" }, { status: 400 })
    }
    await dbQuery(
      "INSERT INTO smtp_settings (host, port, username, password, from_email, from_name, secure) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [host, parsedPort, username, String(password), fromEmail, fromName, Boolean(secure)],
    )
  }

  return NextResponse.json({ success: true })
}
