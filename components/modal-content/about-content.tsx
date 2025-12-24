"use client"

import { useEffect, useState } from "react"
import type { About } from "@/lib/types"
import Image from "next/image"
import { palette } from "@/lib/palette"

export default function AboutContent() {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setAbout(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!about) {
    return <div className="text-center py-8" style={{ color: palette.textMuted }}>No information available yet.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2"
          style={{ background: palette.windowBg, borderColor: palette.border, boxShadow: "0 2px 0 #00000030" }}
        >
          {about.avatar_url ? (
            <Image
              src={about.avatar_url || "/placeholder.svg"}
              alt={about.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: palette.textMuted }}>
              👤
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-black" style={{ color: palette.textDark }}>
            {about.name}
          </h3>
          <p className="font-mono mt-1" style={{ color: palette.blueEdge }}>
            {about.title}
          </p>
        </div>
      </div>

      <div className="leading-relaxed whitespace-pre-wrap" style={{ color: palette.textDark }}>
        {about.description}
      </div>

      <div className="pt-4" style={{ borderTop: `2px solid ${palette.blueEdge}` }}>
        <p className="text-sm font-mono" style={{ color: palette.textMuted }}>
          Thanks for exploring my little world. Feel free to walk around and check out my work.
        </p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-lg bg-white/10" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-2/3 bg-white/10 rounded" />
      </div>
    </div>
  )
}
