"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Mail, Phone, Calendar, AlertCircle } from "lucide-react"
import styles from "@/styles/habbo.module.css"

type MailingListEntry = {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
  status: string
}

export default function MailingListViewer() {
  const [entries, setEntries] = useState<MailingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/mailing-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      } else {
        setError("Failed to load mailing list")
      }
    } catch (err) {
      setError("Error loading mailing list")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus entry ini?")) return

    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/mailing-list?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id))
      } else {
        alert("Failed to delete entry")
      }
    } catch (err) {
      alert("Error deleting entry")
    }
  }

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Phone", "Date", "Status"].join(","),
      ...entries.map((e) =>
        [
          `"${e.name}"`,
          `"${e.email}"`,
          `"${e.phone || ""}"`,
          `"${new Date(e.created_at).toLocaleDateString()}"`,
          `"${e.status}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mailing-list-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-sm font-semibold text-slate-600">Loading subscribers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex items-center gap-2 px-4 py-3 border-2 border-black rounded-lg bg-red-100 text-red-700 text-sm font-semibold">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Mailing List</h2>
          <p className="text-xs font-semibold text-slate-600">{entries.length} subscribers recorded</p>
        </div>
        <Button
          onClick={handleExport}
          className={`${styles.pixelButton} h-10`}
          disabled={entries.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="border-2 border-black rounded-xl bg-white/80 px-6 py-10 text-center font-semibold text-slate-600 shadow-[0_3px_0_rgba(0,0,0,0.2)]">
          No mailing list entries yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border-2 border-black rounded-xl bg-white/90 px-4 py-4 shadow-[0_3px_0_rgba(0,0,0,0.2)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{entry.name}</h3>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full border-2 border-black uppercase tracking-wide"
                      style={{
                        background: entry.status === "subscribed" ? "#bbf7d0" : "#fecaca",
                        color: entry.status === "subscribed" ? "#047857" : "#b91c1c",
                      }}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${entry.email}`} className="hover:text-[#2563eb]">
                        {entry.email}
                      </a>
                    </div>
                    {entry.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${entry.phone}`} className="hover:text-[#2563eb]">
                          {entry.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-100/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
