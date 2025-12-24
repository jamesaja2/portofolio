"use client"

import { useEffect, useState } from "react"
import type { Skill } from "@/lib/types"
import Image from "next/image"
import { palette } from "@/lib/palette"

export default function SkillsContent() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        setSkills(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (skills.length === 0) {
    return <div className="text-center py-8" style={{ color: palette.textMuted }}>No skills added yet.</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm mb-6" style={{ color: palette.textMuted }}>
        Technologies and tools I work with on a daily basis. Always learning something new.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {skills.map((skill, index) => (
          <div
            key={skill.id}
            className="group flex flex-col items-center gap-3 p-4 border-2 rounded-lg transition-all"
            style={{
              animationDelay: `${index * 50}ms`,
              background: palette.windowInner,
              borderColor: palette.border,
              boxShadow: "0 3px 0 #00000030",
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              {skill.logo_url ? (
                <Image
                  src={skill.logo_url || "/placeholder.svg"}
                  alt={skill.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-[#4A90D9]/20 rounded flex items-center justify-center text-white/40">
                  {skill.name[0]}
                </div>
              )}
            </div>
            <span className="text-sm font-mono text-center" style={{ color: palette.textDark }}>
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-lg">
          <div className="w-12 h-12 bg-white/10 rounded" />
          <div className="h-4 w-16 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  )
}
