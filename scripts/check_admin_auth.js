const { Client } = require('pg')

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('Missing ADMIN_EMAIL environment variable')
    process.exit(1)
  }
  
  const c = new Client({ connectionString: process.env.SUPABASE_DB_URL })
  await c.connect()
  const r = await c.query("select id,email,encrypted_password,created_at from auth.users where email=$1", [adminEmail])
  console.log(r.rows)
  await c.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
