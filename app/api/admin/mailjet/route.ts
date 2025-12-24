import { NextRequest, NextResponse } from "next/server"
import { dbQuery } from "@/lib/db"
import { isAdminAuthorized } from "@/lib/admin-auth"

type MailjetRecord = {
  id: string
  api_key: string
  api_secret: string | null
  from_email: string
  from_name: string
}

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthorized(request)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { rows } = await dbQuery<MailjetRecord>(
    "SELECT id, api_key, api_secret, from_email, from_name FROM mailjet_settings ORDER BY updated_at DESC LIMIT 1",
  )

  if (!rows.length) {
    return NextResponse.json(null)
  }

  const record = rows[0]

  return NextResponse.json({
    apiKey: record.api_key,
    fromEmail: record.from_email,
    fromName: record.from_name,
    hasSecret: Boolean(record.api_secret),
  })
}

export async function PUT(request: NextRequest) {
  const isAdmin = await isAdminAuthorized(request)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { apiKey, apiSecret, fromEmail, fromName } = body ?? {}

  if (!apiKey || !fromEmail || !fromName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const trimmedKey = String(apiKey).trim()
  const trimmedSecret = apiSecret ? String(apiSecret).trim() : ""
  const trimmedFromEmail = String(fromEmail).trim()
  const trimmedFromName = String(fromName).trim()

  if (!trimmedKey) {
    return NextResponse.json({ error: "API Key wajib diisi" }, { status: 400 })
  }
  if (!trimmedFromEmail) {
    return NextResponse.json({ error: "From email wajib diisi" }, { status: 400 })
  }
  if (!trimmedFromName) {
    return NextResponse.json({ error: "From name wajib diisi" }, { status: 400 })
  }

  const { rows } = await dbQuery<Pick<MailjetRecord, "id" | "api_secret">>(
    "SELECT id, api_secret FROM mailjet_settings ORDER BY updated_at DESC LIMIT 1",
  )

  if (rows.length) {
    const existing = rows[0]
    await dbQuery(
      "UPDATE mailjet_settings SET api_key=$1, api_secret=$2, from_email=$3, from_name=$4, updated_at=NOW() WHERE id=$5",
      [
        trimmedKey,
        trimmedSecret ? trimmedSecret : existing.api_secret,
        trimmedFromEmail,
        trimmedFromName,
        existing.id,
      ],
    )
  } else {
    if (!trimmedSecret) {
      return NextResponse.json({ error: "API Secret wajib diisi" }, { status: 400 })
    }

    await dbQuery(
      "INSERT INTO mailjet_settings (api_key, api_secret, from_email, from_name) VALUES ($1,$2,$3,$4)",
      [trimmedKey, trimmedSecret, trimmedFromEmail, trimmedFromName],
    )
  }

  return NextResponse.json({ success: true })
}
