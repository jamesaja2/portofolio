"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react"
import type { Experience } from "@/lib/types"
import styles from "@/styles/habbo.module.css"

// Helper to get admin auth header
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newExp, setNewExp] = useState({
    company: "",
    role: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
  })

  useEffect(() => {
    fetch("/api/experience")
      .then((res) => res.json())
      .then((data) => {
        setExperiences(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExp.company.trim() || !newExp.role.trim()) return

    setIsAdding(true)
    try {
      const res = await fetch("/api/experience", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newExp,
          sort_order: experiences.length + 1,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setExperiences([...experiences, data])
        setNewExp({
          company: "",
          role: "",
          description: "",
          start_date: "",
          end_date: "",
          is_current: false,
        })
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdate = async (exp: Experience) => {
    setSaving(exp.id)
    try {
      await fetch("/api/experience", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(exp),
      })
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return

    try {
      const res = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        setExperiences(experiences.filter((e) => e.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#fde68a] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">Add New Experience</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Company</Label>
                <Input
                  value={newExp.company}
                  onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Company Name"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Role</Label>
                <Input
                  value={newExp.role}
                  onChange={(e) => setNewExp((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Your Position"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</Label>
              <Textarea
                value={newExp.description}
                onChange={(e) => setNewExp((p) => ({ ...p, description: e.target.value }))}
                placeholder="What did you accomplish?"
                rows={3}
                className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 resize-none`}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Start Date</Label>
                <Input
                  value={newExp.start_date}
                  onChange={(e) => setNewExp((p) => ({ ...p, start_date: e.target.value }))}
                  placeholder="2020"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">End Date</Label>
                <Input
                  value={newExp.end_date}
                  onChange={(e) => setNewExp((p) => ({ ...p, end_date: e.target.value }))}
                  placeholder="2022"
                  disabled={newExp.is_current}
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 disabled:opacity-60`}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <Checkbox
                    checked={newExp.is_current}
                    onCheckedChange={(v) => setNewExp((p) => ({ ...p, is_current: !!v, end_date: "" }))}
                  />
                  Current Position
                </label>
              </div>
            </div>
            <Button type="submit" disabled={isAdding} className={`${styles.pixelButton} h-11 px-6`}
            >
              {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Experience
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#dbeafe] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">Experience ({experiences.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-xl border-2 border-black bg-white shadow-[0_2px_0_rgba(0,0,0,0.2)]"
              >
                <div
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                >
                  <div>
                    <h4 className="text-slate-900 text-base font-bold">{exp.role}</h4>
                    <p className="text-xs font-semibold text-slate-600">
                      {exp.company} • {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(exp.id)
                      }}
                      className="border-2 border-black bg-rose-100 text-rose-600 hover:bg-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === exp.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {expandedId === exp.id && (
                  <div className="border-t-2 border-black/10 bg-[#f8fafc] px-4 py-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            setExperiences((p) =>
                              p.map((ex) => (ex.id === exp.id ? { ...ex, company: e.target.value } : ex)),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Role</Label>
                        <Input
                          value={exp.role}
                          onChange={(e) =>
                            setExperiences((p) =>
                              p.map((ex) => (ex.id === exp.id ? { ...ex, role: e.target.value } : ex)),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</Label>
                      <Textarea
                        value={exp.description || ""}
                        onChange={(e) =>
                          setExperiences((p) =>
                            p.map((ex) => (ex.id === exp.id ? { ...ex, description: e.target.value } : ex)),
                          )
                        }
                        rows={3}
                        className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 resize-none`}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Start Date</Label>
                        <Input
                          value={exp.start_date}
                          onChange={(e) =>
                            setExperiences((p) =>
                              p.map((ex) => (ex.id === exp.id ? { ...ex, start_date: e.target.value } : ex)),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">End Date</Label>
                        <Input
                          value={exp.end_date || ""}
                          onChange={(e) =>
                            setExperiences((p) =>
                              p.map((ex) => (ex.id === exp.id ? { ...ex, end_date: e.target.value } : ex)),
                            )
                          }
                          disabled={exp.is_current}
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 disabled:opacity-60`}
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                          <Checkbox
                            checked={exp.is_current}
                            onCheckedChange={(v) =>
                              setExperiences((p) =>
                                p.map((ex) =>
                                  ex.id === exp.id ? { ...ex, is_current: !!v, end_date: v ? "" : ex.end_date } : ex,
                                ),
                              )
                            }
                          />
                          Current
                        </label>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUpdate(exp)}
                      disabled={saving === exp.id}
                      className={`${styles.pixelButton} h-11 px-6`}
                    >
                      {saving === exp.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {experiences.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-slate-300 bg-white/70 py-6 text-center text-sm font-semibold text-slate-500">
                No experience added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
