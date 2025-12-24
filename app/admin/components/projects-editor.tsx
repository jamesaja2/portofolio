"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp, X } from "lucide-react"
import type { Project } from "@/lib/types"
import styles from "@/styles/habbo.module.css"

// Helper to get admin auth header
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

type Skill = {
  id: string
  name: string
  logo_url: string | null
}

type NewProjectForm = {
  title: string
  description: string
  stack: string
  skill_ids: string[]
  image_url: string
  project_url: string
}

const EMPTY_FORM: NewProjectForm = {
  title: "",
  description: "",
  stack: "",
  skill_ids: [],
  image_url: "",
  project_url: "",
}

const toStackArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newProject, setNewProject] = useState<NewProjectForm>(EMPTY_FORM)

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [projectsRes, skillsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/skills")
        ])
        
        if (!projectsRes.ok || !skillsRes.ok) {
          throw new Error("Failed to fetch data")
        }
        
        const [projectsData, skillsData] = await Promise.all([
          projectsRes.json(),
          skillsRes.json()
        ])
        
        if (isActive) {
          setProjects(Array.isArray(projectsData) ? projectsData : [])
          setSkills(Array.isArray(skillsData) ? skillsData : [])
        }
      } catch (error) {
        console.error(error)
        if (isActive) {
          setProjects([])
          setSkills([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isActive = false
    }
  }, [])

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newProject.title.trim()) return

    setIsAdding(true)
    try {
      const payload = {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        stack: toStackArray(newProject.stack),
        skill_ids: newProject.skill_ids,
        image_url: newProject.image_url.trim() || null,
        project_url: newProject.project_url.trim() || null,
        sort_order: projects.length,
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Failed to create project: ${res.status}`)
      }

      const created: Project = await res.json()
      setProjects((prev) => [...prev, created])
      setNewProject(EMPTY_FORM)
      setExpandedId(created.id)
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdate = async (project: Project) => {
    setSaving(project.id)
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...project,
          image_url: project.image_url || null,
          project_url: project.project_url || null,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to update project: ${res.status}`)
      }

      const updated: Project = await res.json()
      setProjects((prev) => prev.map((item) => (item.id === project.id ? updated : item)))
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return

    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!res.ok) {
        throw new Error(`Failed to delete project: ${res.status}`)
      }

      setProjects((prev) => prev.filter((project) => project.id !== id))
      if (expandedId === id) {
        setExpandedId(null)
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

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#fde68a] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">Add New Project</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Title</Label>
                <Input
                  value={newProject.title}
                  onChange={(event) => setNewProject((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Project Name"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tech Stack (Skills)</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {newProject.skill_ids.map((skillId) => {
                      const skill = skills.find(s => s.id === skillId)
                      return skill ? (
                        <div key={skillId} className="flex items-center gap-1 px-2 py-1 border-2 border-black rounded-lg bg-[#bfdbfe]">
                          {skill.logo_url && (
                            <img src={skill.logo_url} alt={skill.name} className="w-4 h-4 object-contain" />
                          )}
                          <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewProject(prev => ({ ...prev, skill_ids: prev.skill_ids.filter(id => id !== skillId) }))}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                  <select
                    className={`${styles.pixelInput} w-full`}
                    value=""
                    onChange={(e) => {
                      const skillId = e.target.value
                      if (skillId && !newProject.skill_ids.includes(skillId)) {
                        setNewProject(prev => ({ ...prev, skill_ids: [...prev.skill_ids, skillId] }))
                      }
                    }}
                  >
                    <option value="">+ Add skill...</option>
                    {skills.filter(s => !newProject.skill_ids.includes(s.id)).map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Additional Stack (optional, comma separated)</Label>
              <Input
                value={newProject.stack}
                onChange={(event) => setNewProject((prev) => ({ ...prev, stack: event.target.value }))}
                placeholder="Other tech not in skills"
                className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</Label>
              <Textarea
                value={newProject.description}
                onChange={(event) => setNewProject((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="What does this project do?"
                rows={3}
                className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 resize-none`}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Image URL</Label>
                <Input
                  value={newProject.image_url}
                  onChange={(event) => setNewProject((prev) => ({ ...prev, image_url: event.target.value }))}
                  placeholder="/projects/cover.png"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Project URL</Label>
                <Input
                  value={newProject.project_url}
                  onChange={(event) => setNewProject((prev) => ({ ...prev, project_url: event.target.value }))}
                  placeholder="https://example.com"
                  className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                />
              </div>
            </div>
            <Button type="submit" disabled={isAdding} className={`${styles.pixelButton} h-11 px-6`}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Project
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-black rounded-2xl bg-white/95 shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <CardHeader className="rounded-t-2xl border-b-2 border-black/20 bg-[#dbeafe] px-6 py-5">
          <CardTitle className="text-slate-900 text-lg font-black uppercase tracking-wide">
            Projects ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl border-2 border-black bg-white shadow-[0_2px_0_rgba(0,0,0,0.2)]">
                <div
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{project.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {project.skills && Array.isArray(project.skills) && project.skills.map((skill: any) => (
                        <div key={skill.id} className="flex items-center gap-1">
                          {skill.logo_url && (
                            <img src={skill.logo_url} alt={skill.name} className="w-4 h-4 object-contain" />
                          )}
                          <span className="text-xs font-semibold text-slate-600">{skill.name}</span>
                        </div>
                      ))}
                      {project.stack && project.stack.length > 0 && project.stack.map((tech: string, i: number) => (
                        <span key={i} className="text-xs font-semibold text-slate-600">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDelete(project.id)
                      }}
                      className="border-2 border-black bg-rose-100 text-rose-600 hover:bg-rose-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedId === project.id ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {expandedId === project.id && (
                  <div className="border-t-2 border-black/10 bg-[#f8fafc] px-4 py-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Title</Label>
                        <Input
                          value={project.title}
                          onChange={(event) =>
                            setProjects((prev) =>
                              prev.map((item) => (item.id === project.id ? { ...item, title: event.target.value } : item)),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tech Stack (Skills)</Label>
                        <div className="mt-1 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {(project.skill_ids || []).map((skillId: string) => {
                              const skill = skills.find(s => s.id === skillId)
                              return skill ? (
                                <div key={skillId} className="flex items-center gap-1 px-2 py-1 border-2 border-black rounded-lg bg-[#bfdbfe]">
                                  {skill.logo_url && (
                                    <img src={skill.logo_url} alt={skill.name} className="w-4 h-4 object-contain" />
                                  )}
                                  <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setProjects((prev) =>
                                        prev.map((item) =>
                                          item.id === project.id
                                            ? { ...item, skill_ids: (item.skill_ids || []).filter((id: string) => id !== skillId) }
                                            : item
                                        )
                                      )
                                    }
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : null
                            })}
                          </div>
                          <select
                            className={`${styles.pixelInput} w-full`}
                            value=""
                            onChange={(e) => {
                              const skillId = e.target.value
                              if (skillId && !(project.skill_ids || []).includes(skillId)) {
                                setProjects((prev) =>
                                  prev.map((item) =>
                                    item.id === project.id
                                      ? { ...item, skill_ids: [...(item.skill_ids || []), skillId] }
                                      : item
                                  )
                                )
                              }
                            }}
                          >
                            <option value="">+ Add skill...</option>
                            {skills.filter(s => !(project.skill_ids || []).includes(s.id)).map(skill => (
                              <option key={skill.id} value={skill.id}>{skill.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Additional Stack (optional)</Label>
                      <Input
                        value={project.stack.join(", ")}
                        onChange={(event) =>
                          setProjects((prev) =>
                            prev.map((item) =>
                              item.id === project.id
                                ? { ...item, stack: toStackArray(event.target.value) }
                                : item,
                            ),
                          )
                        }
                        placeholder="Other tech not in skills"
                        className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(event) =>
                          setProjects((prev) =>
                            prev.map((item) =>
                              item.id === project.id ? { ...item, description: event.target.value } : item,
                            ),
                          )
                        }
                        rows={3}
                        className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500 resize-none`}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Image URL</Label>
                        <Input
                          value={project.image_url || ""}
                          onChange={(event) =>
                            setProjects((prev) =>
                              prev.map((item) =>
                                item.id === project.id
                                  ? { ...item, image_url: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Project URL</Label>
                        <Input
                          value={project.project_url || ""}
                          onChange={(event) =>
                            setProjects((prev) =>
                              prev.map((item) =>
                                item.id === project.id
                                  ? { ...item, project_url: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className={`${styles.pixelInput} mt-1 text-slate-900 placeholder:text-slate-500`}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUpdate(project)}
                      disabled={saving === project.id}
                      className={`${styles.pixelButton} h-11 px-6`}
                    >
                      {saving === project.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-slate-300 bg-white/70 py-6 text-center text-sm font-semibold text-slate-500">
                No projects added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
