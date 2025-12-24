"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { palette } from "@/lib/palette"
import styles from "@/styles/habbo.module.css"
import type { HotspotType } from "@/lib/types"
import AboutContent from "./modal-content/about-content"
import SkillsContent from "./modal-content/skills-content"
import ProjectsContent from "./modal-content/projects-content"
import ExperienceContent from "./modal-content/experience-content"
import ContactContent from "./modal-content/contact-content"

interface Props {
  type: HotspotType
  id?: string
  onClose: () => void
}

const MODAL_TITLES: Record<HotspotType, string> = {
  about: "About Me",
  skills: "My Skills",
  projects: "Projects",
  experience: "Experience",
  contact: "Get in Touch",
}

export default function PortfolioModal({ type, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    // Close on Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isClosing ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden transition-all duration-300 border-2 border-black rounded-2xl shadow-[0_6px_0_#000,0_0_0_2px_${palette.blueEdge}] ${
          isVisible && !isClosing ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{ background: palette.windowBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-black"
          style={{
            background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)`,
            boxShadow: "inset 0 0 0 2px #3b5f76",
          }}
        >
          <div className="flex items-center gap-3">
            <div className={styles.logoBlock}>
              <span className={styles.logoWord}>JAMES.DEV</span>
            </div>
            <h2 className="text-base sm:text-lg font-black" style={{ color: palette.textDark }}>
              {MODAL_TITLES[type]}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className="border-2 border-black rounded-full !w-8 !h-8 hover:opacity-80 transition-opacity"
            style={{ background: palette.redClose, boxShadow: "inset 0 0 0 2px #7f1d1d" }}
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]"
          style={{ background: palette.windowInner, borderTop: `2px solid ${palette.blueEdge}` }}
        >
          {type === "about" && <AboutContent />}
          {type === "skills" && <SkillsContent />}
          {type === "projects" && <ProjectsContent />}
          {type === "experience" && <ExperienceContent />}
          {type === "contact" && <ContactContent onSuccess={handleClose} />}
        </div>
      </div>
    </div>
  )
}
