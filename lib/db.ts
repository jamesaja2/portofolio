import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn("[DB] DATABASE_URL is not set. API routes will fail to connect to Neon.")
}

// Neon pooler supports standard Postgres pooling
const pool = new Pool({
  connectionString,
  max: 10,
  ssl: { rejectUnauthorized: false },
})

export async function dbQuery<T = any>(text: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const res = await client.query<T>(text, params)
    return res
  } finally {
    client.release()
  }
}

export default pool
