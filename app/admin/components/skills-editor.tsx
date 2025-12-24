"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2, Save } from "lucide-react"
import type { Skill } from "@/lib/types"
import styles from "@/styles/habbo.module.css"

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

type NewSkillForm = {
  name: string
  logo_url: string
}

const EMPTY_SKILL: NewSkillForm = {
  name: "",
  logo_url: "",
}

export default function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newSkill, setNewSkill] = useState<NewSkillForm>(EMPTY_SKILL)

  useEffect(() => {
    let isActive = true

    const loadSkills = async () => {
      try {
        const res = await fetch("/api/skills")
        if (!res.ok) {
          throw new Error(`Failed to fetch skills: ${res.status}`)
        }
        const data = await res.json()
        if (isActive) {
          setSkills(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error(error)
        if (isActive) {
          setSkills([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadSkills()

    return () => {
      isActive = false
    }
  }, [])

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newSkill.name.trim()) return

    setAdding(true)
    try {
      const payload = {
        name: newSkill.name.trim(),
        logo_url: newSkill.logo_url.trim() || null,
        sort_order: skills.length,
      }

      const res = await fetch("/api/skills", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Failed to create skill: ${res.status}`)
      }

      const created: Skill = await res.json()
      setSkills((prev) => [...prev, created])
      setNewSkill(EMPTY_SKILL)
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false)
    }
  }

  const handleUpdate = async (skill: Skill) => {
    setSaving(skill.id)
    try {
      const res = await fetch("/api/skills", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...skill,
          logo_url: skill.logo_url || null,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to update skill: ${res.status}`)
      }

      const updated: Skill = await res.json()
      setSkills((prev) => prev.map((item) => (item.id === skill.id ? updated : item)))
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return

    try {
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!res.ok) {
        throw new Error(`Failed to delete skill: ${res.status}`)
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== id))
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

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#fde68a] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">Add New Skill</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Name</Label>
                <Input
                  value={newSkill.name}
                  onChange={(event) => setNewSkill((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="React"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Logo URL</Label>
                <Input
                  value={newSkill.logo_url}
                  onChange={(event) => setNewSkill((prev) => ({ ...prev, logo_url: event.target.value }))}
                  placeholder="/logos/react.svg"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
            </div>
            <Button type="submit" disabled={adding} className={`${styles.pixelButton} h-11 px-6`}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Skill
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#dbeafe] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">
            Skills ({skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <div className="space-y-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-col gap-3 rounded-xl border-2 border-black bg-white px-4 py-4 shadow-[0_2px_0_rgba(0,0,0,0.2)] sm:flex-row sm:items-center"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-black bg-[#dbeafe]">
                  {skill.logo_url ? (
                    <Image
                      src={skill.logo_url || "/placeholder.svg"}
                      alt={skill.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-lg font-black text-slate-600">{skill.name[0]}</span>
                  )}
                </div>
                <Input
                  value={skill.name}
                  onChange={(event) =>
                    setSkills((prev) =>
                      prev.map((item) => (item.id === skill.id ? { ...item, name: event.target.value } : item)),
                    )
                  }
                  className={`${styles.pixelInput} flex-1 text-slate-900 placeholder:text-slate-500`}
                />
                <Input
                  value={skill.logo_url || ""}
                  onChange={(event) =>
                    setSkills((prev) =>
                      prev.map((item) => (item.id === skill.id ? { ...item, logo_url: event.target.value } : item)),
                    )
                  }
                  placeholder="Logo URL"
                  className={`${styles.pixelInput} flex-1 text-slate-900 placeholder:text-slate-500`}
                />
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleUpdate(skill)}
                    disabled={saving === skill.id}
                    className="border-2 border-black bg-white/80 text-slate-700 hover:bg-[#dbeafe]"
                  >
                    {saving === skill.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(skill.id)}
                    className="border-2 border-black bg-rose-100 text-rose-600 hover:bg-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-slate-300 bg-white/70 py-6 text-center text-sm font-semibold text-slate-500">
                No skills added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
