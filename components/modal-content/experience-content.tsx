"use client"

import { useEffect, useState } from "react"
import type { Experience } from "@/lib/types"
import { palette } from "@/lib/palette"

export default function ExperienceContent() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/experience")
      .then((res) => res.json())
      .then((data) => {
        setExperiences(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (experiences.length === 0) {
    return <div className="text-center py-8" style={{ color: palette.textMuted }}>No experience added yet.</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm mb-6" style={{ color: palette.textMuted }}>
        My journey so far. Each role shaped how I approach building software today.
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: palette.blueEdge }} />

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="relative pl-10" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Timeline dot */}
              <div
                className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2"
                style={{
                  background: exp.is_current ? palette.yellow : palette.windowBg,
                  borderColor: palette.border,
                  boxShadow: exp.is_current ? "0 0 0 2px rgba(255,204,0,0.4)" : undefined,
                }}
              />

              <div
                className="border-2 rounded-lg p-4"
                style={{ background: palette.windowInner, borderColor: palette.border, boxShadow: "0 3px 0 #00000030" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-semibold" style={{ color: palette.textDark }}>
                    {exp.role}
                  </h4>
                  <span className="text-sm font-mono" style={{ color: palette.blueEdge }}>
                    {exp.start_date} — {exp.is_current ? "Present" : exp.end_date}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: palette.textMuted }}>
                  {exp.company}
                </p>
                {exp.description && (
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: palette.textDark }}>
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="pl-10">
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
