const { Pool } = require("pg")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8")
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
}

async function setupAuth() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    console.log("Setting up authentication tables...")

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, "003_create_users_table.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")
    await pool.query(sql)
    console.log("✅ Users and sessions tables created")

    // Hash admin password
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error("❌ Error: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local")
      process.exit(1)
    }
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    // Insert admin user (if not exists)
    const checkUser = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail])

    if (checkUser.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
        [adminEmail, passwordHash, "admin"]
      )
      console.log(`✅ Admin user created: ${adminEmail}`)
    } else {
      // Update password if user exists
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [passwordHash, adminEmail])
      console.log(`✅ Admin user password updated: ${adminEmail}`)
    }

    console.log("\n✅ Authentication setup complete!")
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    await pool.end()
  }
}

setupAuth()
