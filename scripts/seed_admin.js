// Run with: node scripts/seed_admin.js
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Creates admin user (if missing) and links to admin_users for RLS.

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const adminEmail = process.env.SEED_ADMIN_EMAIL
const adminPassword = process.env.SEED_ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  console.error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD environment variables')
  process.exit(1)
}

async function main() {
  const supabase = createClient(url, serviceKey)

  // Upsert auth user
  const { data: existingUser, error: fetchErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (fetchErr) {
    console.error('Failed to list users', fetchErr)
    process.exit(1)
  }
  let user = existingUser?.users?.find((u) => u.email === adminEmail)

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })
    if (error) {
      console.error('Failed to create admin user', error)
      process.exit(1)
    }
    user = data.user
    console.log('Created admin user', user.id)
  } else {
    console.log('Admin user already exists', user.id)
  }

  // Link into admin_users table for RLS
  const { error: linkErr } = await supabase.from('admin_users').upsert({ id: user.id, email: adminEmail })
  if (linkErr) {
    console.error('Failed to upsert admin_users', linkErr)
    process.exit(1)
  }
  console.log('Admin linked to admin_users')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
