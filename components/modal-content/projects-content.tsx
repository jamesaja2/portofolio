"use client"

import { useEffect, useState } from "react"
import type { Project } from "@/lib/types"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { palette } from "@/lib/palette"

export default function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (projects.length === 0) {
    return <div className="text-center py-8" style={{ color: palette.textMuted }}>No projects added yet.</div>
  }

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
  }

  return (
    <div className="space-y-4">
      <p className="text-sm mb-6" style={{ color: palette.textMuted }}>
        A selection of projects I have shipped. Each one taught me something new.
      </p>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="w-full text-left group flex gap-4 p-4 border-2 rounded-lg transition-all"
            style={{
              animationDelay: `${index * 100}ms`,
              background: palette.windowInner,
              borderColor: palette.border,
              boxShadow: "0 3px 0 #00000030",
            }}
          >
            <div
              className="w-20 h-20 flex-shrink-0 rounded overflow-hidden border"
              style={{ background: palette.windowBg, borderColor: palette.border }}
            >
              {project.image_url ? (
                <Image
                  src={project.image_url || "/placeholder.svg"}
                  alt={project.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📁</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="font-semibold group-hover:underline underline-offset-4 transition-colors"
                style={{ color: palette.textDark }}
              >
                {project.title}
              </h4>
              <p className="text-sm mt-1 line-clamp-2" style={{ color: palette.textMuted }}>
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.skills && Array.isArray(project.skills) && project.skills.map((skill: any) => (
                  <span
                    key={skill.id}
                    className="text-xs px-2 py-1 rounded border flex items-center gap-1"
                    style={{ background: palette.windowBg, borderColor: palette.border, color: palette.textDark }}
                  >
                    {skill.logo_url && (
                      <img src={skill.logo_url} alt={skill.name} className="w-3.5 h-3.5 object-contain" />
                    )}
                    <span>{skill.name}</span>
                  </span>
                ))}
                {project.stack && project.stack.length > 0 && project.stack.map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ background: palette.windowBg, borderColor: palette.border, color: palette.textDark }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm font-mono flex items-center gap-1"
        style={{ color: palette.blueEdge }}
      >
        ← Back to projects
      </button>

      {project.image_url && (
        <div
          className="w-full aspect-video rounded-lg overflow-hidden"
          style={{ background: palette.windowBg, border: `2px solid ${palette.border}` }}
        >
          <Image
            src={project.image_url || "/placeholder.svg"}
            alt={project.title}
            width={600}
            height={340}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div>
        <h3 className="text-2xl font-black" style={{ color: palette.textDark }}>
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {project.skills && Array.isArray(project.skills) && project.skills.map((skill: any) => (
            <span
              key={skill.id}
              className="text-sm px-3 py-1.5 rounded-full border flex items-center gap-1.5"
              style={{ background: palette.windowBg, borderColor: palette.border, color: palette.textDark }}
            >
              {skill.logo_url && (
                <img src={skill.logo_url} alt={skill.name} className="w-4 h-4 object-contain" />
              )}
              <span>{skill.name}</span>
            </span>
          ))}
          {project.stack && project.stack.length > 0 && project.stack.map((tech: string, idx: number) => (
            <span
              key={`stack-${idx}`}
              className="text-sm px-3 py-1.5 rounded-full border"
              style={{ background: palette.windowBg, borderColor: palette.border, color: palette.textDark }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <p className="leading-relaxed" style={{ color: palette.textDark }}>
        {project.description}
      </p>

      {project.project_url && (
        <a
          href={project.project_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors"
          style={{
            background: `linear-gradient(180deg, ${palette.yellow} 0%, #f3b700 100%)`,
            borderColor: palette.border,
            color: palette.textDark,
            boxShadow: "0 3px 0 #00000030",
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Visit Project
        </a>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-lg">
          <div className="w-20 h-20 bg-white/10 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
