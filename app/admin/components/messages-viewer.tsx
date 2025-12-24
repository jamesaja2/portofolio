"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, MailOpen, Trash2, ExternalLink } from "lucide-react"
import type { ContactMessage } from "@/lib/types"
import styles from "@/styles/habbo.module.css"

// Helper function to get auth header from localStorage
function getAuthHeader() {
  const token = localStorage.getItem("admin_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function MessagesViewer() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authHeader = getAuthHeader()

    fetch("/api/contact", { headers: authHeader })
      .then((res) => res.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id: string, is_read: boolean) => {
    try {
      const authHeader = getAuthHeader()

      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id, is_read }),
      })
      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, is_read } : message)))
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return

    try {
      const authHeader = getAuthHeader()
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
        headers: authHeader,
      })
      if (res.ok) {
        setMessages((prev) => prev.filter((message) => message.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
      </div>
    )
  }

  const unreadCount = messages.filter((message) => !message.is_read).length

  return (
    <Card className="rounded-2xl border-2 border-black bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
      <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#dbeafe] px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-wide text-slate-900">
          Contact Messages
          {unreadCount > 0 && (
            <span className="rounded-full border-2 border-black bg-[#fef08a] px-2 py-0.5 text-xs font-bold text-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
              {unreadCount} new
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border-2 border-black px-4 py-4 shadow-[0_2px_0_rgba(0,0,0,0.2)] ${
                message.is_read ? "bg-white" : "bg-[#fef9c3]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {message.is_read ? (
                      <MailOpen className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Mail className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm font-bold text-slate-900">{message.name}</span>
                    <a
                      href={`mailto:${message.email}`}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {message.email}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{message.message}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {new Date(message.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(message.id, !message.is_read)}
                    className={`${styles.pixelButton} h-9 bg-[#bfdbfe] px-4 !shadow-none hover:bg-[#93c5fd]`}
                  >
                    {message.is_read ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(message.id)}
                    className="border-2 border-black bg-rose-100 text-rose-600 hover:bg-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 py-10 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="font-semibold text-slate-500">No messages yet</p>
              <p className="mt-1 text-sm text-slate-400">Messages from your contact form will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
