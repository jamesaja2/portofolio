// Temporary admin auth handler - simple auth without Supabase auth service
// Use until Supabase fixes "Database error querying schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log("[ADMIN LOGIN] Received request for email:", email)

    // Hardcoded admin credentials (TEMPORARY - replace with DB lookup)
    const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'jamestimothyaja@gmail.com'
    const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || '12Okt2025LENOVO#'

    console.log("[ADMIN LOGIN] Expected email:", ADMIN_EMAIL)
    console.log("[ADMIN LOGIN] Email match:", email === ADMIN_EMAIL)
    console.log("[ADMIN LOGIN] Password match:", password === ADMIN_PASSWORD)

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Return a simple token (not real JWT, just for frontend identification)
      const token = btoa(JSON.stringify({ email, iat: Date.now() }))
      console.log("[ADMIN LOGIN] Success! Token:", token.substring(0, 20) + '...')
      return Response.json({
        success: true,
        token,
        user: { id: 'admin-user', email, role: 'admin' }
      })
    }

    console.log("[ADMIN LOGIN] Failed - invalid credentials")
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (err) {
    console.error('[ADMIN LOGIN] Error:', err)
    return Response.json({ error: 'Auth failed: ' + String(err) }, { status: 500 })
  }
}
