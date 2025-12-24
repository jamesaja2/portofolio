"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2 } from "lucide-react"
import type { About } from "@/lib/types"
import styles from "@/styles/habbo.module.css"

// Helper to get admin auth header
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function AboutEditor() {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setAbout(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!about) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(about),
      })

      if (res.ok) {
        const data = await res.json()
        setAbout(data)
        setMessage({ type: "success", text: "Changes saved successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to save changes" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save changes" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A90D9]" />
      </div>
    )
  }

  return (
    <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
      <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#dbeafe] px-6 py-5">
        <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">About Me</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Name
              </Label>
              <Input
                id="name"
                value={about?.name || ""}
                onChange={(e) => setAbout((a) => (a ? { ...a, name: e.target.value } : null))}
                className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Title
              </Label>
              <Input
                id="title"
                value={about?.title || ""}
                onChange={(e) => setAbout((a) => (a ? { ...a, title: e.target.value } : null))}
                className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Description
            </Label>
            <Textarea
              id="description"
              value={about?.description || ""}
              onChange={(e) => setAbout((a) => (a ? { ...a, description: e.target.value } : null))}
              rows={6}
              className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 resize-none`}
            />
          </div>

          <div>
            <Label htmlFor="avatar" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Avatar URL
            </Label>
            <Input
              id="avatar"
              value={about?.avatar_url || ""}
              onChange={(e) => setAbout((a) => (a ? { ...a, avatar_url: e.target.value } : null))}
              placeholder="/avatars/your-avatar.png"
              className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
            />
          </div>

          {message && (
            <div
              className={`px-4 py-3 border-2 border-black rounded-xl text-sm font-semibold ${message.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={saving} className={`${styles.pixelButton} mt-2 h-11 px-6`}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
