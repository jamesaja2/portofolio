// Run: node scripts/apply_sql.js scripts/101_neon_create_tables.sql scripts/102_neon_seed.sql
// Uses DATABASE_URL from environment.

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const files = process.argv.slice(2)
  if (!files.length) {
    console.error('Usage: node scripts/apply_sql.js <file1.sql> <file2.sql> ...')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Missing DATABASE_URL env var')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    for (const file of files) {
      const sqlPath = path.resolve(file)
      const sql = fs.readFileSync(sqlPath, 'utf8')
      console.log(`\nApplying ${sqlPath} ...`)
      await client.query(sql)
      console.log(`Done: ${sqlPath}`)
    }
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
