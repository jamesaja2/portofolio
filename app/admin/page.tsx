"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "./components/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    const storedEmail = localStorage.getItem("admin_email")

    if (!token || !storedEmail) {
      router.push("/auth/admin-login")
      return
    }

    setEmail(storedEmail)
    setIsAuth(true)
  }, [router])

  if (!isAuth) {
    return <div>Loading...</div>
  }

  return <AdminDashboard userEmail={email} />
}
