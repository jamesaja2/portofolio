"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle } from "lucide-react"
import { palette } from "@/lib/palette"

interface Props {
  onSuccess?: () => void
}

export default function ContactContent({ onSuccess }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required"
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        const data = await res.json()
        setErrors({ form: data.error || "Something went wrong" })
      }
    } catch {
      setErrors({ form: "Failed to send message. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: palette.green }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: palette.textDark }}>
          Message Sent!
        </h3>
        <p style={{ color: palette.textMuted }}>Thanks for reaching out. I will get back to you soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: palette.textMuted }}>
        Have a project in mind or just want to say hi? Drop me a message and I will get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" style={{ color: palette.textDark }}>
            Name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="mt-1"
            style={{
              background: palette.windowInner,
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          {errors.name && (
            <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" style={{ color: palette.textDark }}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="your@email.com"
            className="mt-1"
            style={{
              background: palette.windowInner,
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          {errors.email && (
            <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="message" style={{ color: palette.textDark }}>
            Message
          </Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Tell me about your project..."
            rows={5}
            className="mt-1 resize-none"
            style={{
              background: palette.windowInner,
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          {errors.message && (
            <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
              {errors.message}
            </p>
          )}
        </div>

        {errors.form && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "#fee2e2", color: "#991b1b", border: "2px solid #b91c1c" }}>
            {errors.form}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          style={{
            background: `linear-gradient(180deg, ${palette.yellow} 0%, #f3b700 100%)`,
            color: palette.textDark,
            border: `2px solid ${palette.border}`,
            boxShadow: "0 3px 0 #00000030",
          }}
        >
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
