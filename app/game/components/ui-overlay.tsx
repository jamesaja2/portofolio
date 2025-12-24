"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Keyboard } from "lucide-react"
import type { HotspotType } from "@/lib/types"

interface Props {
  playerName: string
  showPrompt: { type: HotspotType; label: string } | null
  onBackClick: () => void
}

export default function UIOverlay({ playerName, showPrompt, onBackClick }: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackClick}
          className="bg-[#16162a]/80 border-[#4A90D9]/30 text-white hover:bg-[#16162a] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>

        <div className="flex items-center gap-3">
          <div className="bg-[#16162a]/80 border border-[#4A90D9]/30 rounded-lg px-4 py-2">
            <span className="text-white/60 text-sm font-mono">Playing as </span>
            <span className="text-white font-mono font-bold">{playerName}</span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="bg-[#16162a]/80 border border-[#4A90D9]/30 rounded-lg px-4 py-3 text-white/60 text-xs font-mono">
          <div className="flex items-center gap-2 mb-1">
            <Keyboard className="w-4 h-4" />
            <span>Controls</span>
          </div>
          <div className="space-y-0.5 text-white/40">
            <p>WASD / Arrows - Move</p>
            <p>Click - Walk to point</p>
            <p>E - Interact</p>
          </div>
        </div>
      </div>

      {/* Interaction prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#4A90D9] text-white px-6 py-3 rounded-lg font-mono text-sm shadow-lg animate-pulse">
            Press <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">E</kbd> to view {showPrompt.label}
          </div>
        </div>
      )}
    </>
  )
}
