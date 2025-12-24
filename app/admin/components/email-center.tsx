"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import styles from "@/styles/habbo.module.css"

interface SmtpState {
  host: string
  port: string
  username: string
  password: string
  fromEmail: string
  fromName: string
  secure: boolean
  hasPassword: boolean
}

interface ToastState {
  type: "success" | "error"
  message: string
}

export default function EmailCenter() {
  const [smtpState, setSmtpState] = useState<SmtpState>({
    host: "",
    port: "587",
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    secure: true,
    hasPassword: false,
  })
  const [loadingSmtp, setLoadingSmtp] = useState(true)
  const [savingSmtp, setSavingSmtp] = useState(false)

  const [subject, setSubject] = useState("")
  const [previewText, setPreviewText] = useState("")
  const [html, setHtml] = useState("<p>Hello crew! 👋</p>")
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState<"test" | "all" | null>(null)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)

  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) return

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    async function loadSmtp() {
      try {
        const res = await fetch("/api/admin/smtp", { headers })
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setSmtpState((prev) => ({
              ...prev,
              host: data.host || "",
              port: String(data.port || ""),
              username: data.username || "",
              fromEmail: data.from_email || "",
              fromName: data.from_name || "",
              secure: Boolean(data.secure),
              hasPassword: Boolean(data.hasPassword ?? true),
              password: "",
            }))
          }
        }
      } finally {
        setLoadingSmtp(false)
      }
    }

    async function loadCount() {
      try {
        const res = await fetch("/api/mailing-list", { headers })
        if (res.ok) {
          const data = await res.json()
          setSubscriberCount(Array.isArray(data) ? data.length : null)
        }
      } catch (error) {
        console.error("Failed to fetch mailing list count", error)
      }
    }

    loadSmtp()
    loadCount()
  }, [])

  const smtpValid = useMemo(() => {
    return (
      smtpState.host.trim() !== "" &&
      smtpState.port.trim() !== "" &&
      smtpState.username.trim() !== "" &&
      smtpState.fromEmail.trim() !== "" &&
      smtpState.fromName.trim() !== ""
    )
  }, [smtpState])

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleSmtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!smtpValid) {
      showToast("error", "Lengkapi semua kolom SMTP terlebih dahulu")
      return
    }

    setSavingSmtp(true)
    try {
      const token = localStorage.getItem("admin_token")
      const body: Record<string, unknown> = {
        host: smtpState.host.trim(),
        port: Number(smtpState.port.trim()),
        username: smtpState.username.trim(),
        fromEmail: smtpState.fromEmail.trim(),
        fromName: smtpState.fromName.trim(),
        secure: smtpState.secure,
      }
      if (smtpState.password.trim()) {
        body.password = smtpState.password.trim()
      }

      const res = await fetch("/api/admin/smtp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save SMTP settings")
      }

      setSmtpState((prev) => ({ ...prev, password: "", hasPassword: true }))
      showToast("success", "SMTP settings updated!")
    } catch (error: any) {
      console.error("SMTP save error", error)
      showToast("error", error.message || "Gagal menyimpan SMTP")
    } finally {
      setSavingSmtp(false)
    }
  }

  const composerReady = subject.trim() !== "" && html.trim() !== ""

  const sendEmail = async (mode: "test" | "all") => {
    if (!composerReady) {
      showToast("error", "Subjek dan konten email wajib diisi")
      return
    }

    if (mode === "test" && testEmail.trim() === "") {
      showToast("error", "Isi email tujuan uji coba")
      return
    }

    setSending(mode)
    try {
      const token = localStorage.getItem("admin_token")
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          html,
          previewText: previewText.trim() || undefined,
          mode,
          testEmail: mode === "test" ? testEmail.trim() : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send email")
      }

      showToast("success", mode === "test" ? "Email test terkirim" : "Email terkirim ke seluruh mailing list")
    } catch (error: any) {
      console.error("Bulk email error", error)
      showToast("error", error.message || "Gagal mengirim email")
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className="px-4 py-2 border-2 border-black rounded-lg text-sm font-semibold"
          style={{
            background: toast.type === "success" ? "#bbf7d0" : "#fee2e2",
            color: toast.type === "success" ? "#065f46" : "#9f1239",
          }}
        >
          {toast.message}
        </div>
      )}

      <section className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_3px_0_rgba(0,0,0,0.25)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">SMTP Settings</h3>
            <p className="text-xs font-semibold text-slate-600">Konfigurasi server email untuk notifikasi dan broadcast</p>
          </div>
          {smtpState.hasPassword && !smtpState.password && (
            <span className="text-[11px] font-bold px-2 py-0.5 border-2 border-black rounded-full bg-[#d1fae5] text-emerald-800 uppercase">
              Credentials saved
            </span>
          )}
        </div>

        {loadingSmtp && (
          <div className="text-[11px] font-semibold text-slate-500 mb-2">Memuat konfigurasi dari server...</div>
        )}

        <form onSubmit={handleSmtpSubmit} className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">SMTP Host</Label>
              <Input
                required
                value={smtpState.host}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, host: e.target.value }))}
                className={styles.pixelInput}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Port</Label>
              <Input
                required
                type="number"
                value={smtpState.port}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, port: e.target.value }))}
                className={styles.pixelInput}
                placeholder="465 atau 587"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Username</Label>
              <Input
                required
                value={smtpState.username}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, username: e.target.value }))}
                className={styles.pixelInput}
                placeholder="akun email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Password / App Password</Label>
              <Input
                type="password"
                value={smtpState.password}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, password: e.target.value }))}
                className={styles.pixelInput}
                placeholder={smtpState.hasPassword ? "●●●●●●● (tersimpan)" : "Masukkan password"}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Sender Name</Label>
              <Input
                required
                value={smtpState.fromName}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, fromName: e.target.value }))}
                className={styles.pixelInput}
                placeholder="James Dev"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Sender Email</Label>
              <Input
                required
                type="email"
                value={smtpState.fromEmail}
                onChange={(e) => setSmtpState((prev) => ({ ...prev, fromEmail: e.target.value }))}
                className={styles.pixelInput}
                placeholder="hello@domain.com"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="smtp-secure"
              checked={smtpState.secure}
              onCheckedChange={(checked) => setSmtpState((prev) => ({ ...prev, secure: checked }))}
            />
            <Label htmlFor="smtp-secure" className="text-xs font-semibold text-slate-700">
              Gunakan koneksi SSL/TLS (aktifkan untuk port 465)
            </Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingSmtp || !smtpValid} className={`${styles.pixelButton} h-10 px-6`}>
              {savingSmtp ? "Saving..." : "Save SMTP"}
            </Button>
          </div>
        </form>
      </section>

      <section className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_3px_0_rgba(0,0,0,0.25)] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">Bulk Email Broadcast</h3>
            <p className="text-xs font-semibold text-slate-600">
              Kirim newsletter ke seluruh subscriber mailing list dengan editor HTML
            </p>
          </div>
          {subscriberCount !== null && (
            <div className="px-3 py-1.5 border-2 border-black rounded-lg bg-[#dbeafe] text-xs font-bold text-slate-700">
              {subscriberCount} recipients terdaftar
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.pixelInput}
              placeholder="Newsletter terbaru"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700">Preview Text (opsional)</Label>
            <Textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className={`${styles.pixelInput} h-20`}
              placeholder="Kalimat pendek yang muncul di preview email"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700">Content</Label>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={html}
              onEditorChange={(value) => setHtml(value)}
              init={{
                height: 360,
                menubar: false,
                plugins: "link lists code table",
                toolbar:
                  "undo redo | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist outdent indent | link table | code",
                content_style:
                  "body { font-family: 'Inter', sans-serif; font-size:14px; line-height:1.6; color:#1f2937; }",
                branding: false,
              }}
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50/80">
          <h4 className="text-xs font-bold text-slate-700 uppercase">Test email</h4>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className={styles.pixelInput}
              placeholder="email uji coba"
            />
            <Button
              type="button"
              disabled={sending === "test" || !composerReady}
              className={`${styles.pixelButton} h-10`}
              onClick={() => sendEmail("test")}
            >
              {sending === "test" ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold text-slate-500">
            Email dikirim satu per satu ke subscriber aktif untuk menghindari alamat terlihat satu sama lain.
          </p>
          <Button
            type="button"
            disabled={sending === "all" || !composerReady || subscriberCount === 0}
            className={`${styles.pixelButton} h-11 px-6`}
            onClick={() => sendEmail("all")}
          >
            {sending === "all" ? "Broadcasting..." : "Send to Mailing List"}
          </Button>
        </div>
      </section>
    </div>
  )
}
