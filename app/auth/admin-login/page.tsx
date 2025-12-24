"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { palette } from "@/lib/palette"
import styles from "@/styles/habbo.module.css"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("Attempting login with:", email)

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", res.status)

      const data = await res.json()
      console.log("Login response:", data)

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      console.log("Login successful, saving token and redirecting")
      localStorage.setItem("admin_token", data.token)
      localStorage.setItem("admin_email", data.user.email)
      router.push("/admin")
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error("Login error:", errMsg)
      setError("Network error: " + errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)` }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg border-4"
        style={{
          background: palette.windowBg,
          borderColor: palette.border,
          boxShadow: "0 8px 0 rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.3)",
        }}
      >
        <div className="text-center mb-6">
          <div className={styles.logoBlock}>
            <span className={styles.logoWord}>ADMIN</span>
          </div>
          <p className="text-sm mt-2" style={{ color: palette.textMuted }}>
            Portfolio Admin Panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: palette.textDark }}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={`${styles.pixelInput} text-slate-900 placeholder:text-slate-500`}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: palette.textDark }}>
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${styles.pixelInput} text-slate-900 placeholder:text-slate-500`}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="p-2 rounded text-sm font-bold border-2"
              style={{
                background: "#ffcccc",
                borderColor: "#cc0000",
                color: "#660000",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold h-10 border-2 border-black text-sm"
            style={{
              background: palette.yellow,
              color: palette.textDark,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
            disabled={loading}
          >
            Back to Game
          </Button>
        </form>
      </div>
    </div>
  )
}
