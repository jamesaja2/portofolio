"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import IsoRoom from "@/components/iso-room"
import PortfolioModal from "@/components/portfolio-modal"
import styles from "@/styles/habbo.module.css"
import { palette } from "@/lib/palette"
import type { HotspotType, Project, Skill, Experience } from "@/lib/types"
import { Button } from "@/components/ui/button"

type InteractiveItem = {
  type: "hotspot"
  id: string
  hotspotType: HotspotType
  label: string
  rect: { x: number; y: number; w: number; h: number }
}

export default function GamePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("Guest")
  const [playerColor, setPlayerColor] = useState("#3b82f6")
  const [outfit, setOutfit] = useState({ shirt: "#3b82f6", pants: "#2b2b2b", hair: "#5b3a1a" })
  const [zoom, setZoom] = useState(1)
  const [points, setPoints] = useState(0)
  const [activeModal, setActiveModal] = useState<{ type: HotspotType; id?: string } | null>(null)
  const [nearbyHotspot, setNearbyHotspot] = useState<{ type: HotspotType; label: string } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem("pp_name") || ""
    
    // Redirect to homepage if no player name
    if (!name) {
      router.push("/")
      return
    }
    
    const avatarId = localStorage.getItem("pp_avatar") || "blue"
    const storedShirt = localStorage.getItem("pp_shirt")
    const storedPants = localStorage.getItem("pp_pants")
    const storedHair = localStorage.getItem("pp_hair")
    const storedPoints = Number.parseInt(localStorage.getItem("pp_points") || "0", 10)

    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      red: "#ef4444",
      green: "#22c55e",
      orange: "#f59e0b",
      purple: "#8b5cf6",
    }

    setPlayerName(name)
    setPlayerColor(colorMap[avatarId] || "#3b82f6")
    setOutfit({
      shirt: storedShirt || colorMap[avatarId] || "#3b82f6",
      pants: storedPants || "#2b2b2b",
      hair: storedHair || "#5b3a1a",
    })
    setPoints(Number.isFinite(storedPoints) ? storedPoints : 0)
    setIsLoaded(true)

    const timer = setTimeout(() => setShowControls(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore jika sedang mengetik di input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      
      if (activeModal) return // Don't open modal if one is already open
      if ((e.key === "e" || e.key === "E") && nearbyHotspot) {
        setActiveModal({ type: nearbyHotspot.type })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nearbyHotspot, activeModal])

  const handleInteractive = useCallback((items: InteractiveItem[]) => {
    const hotspot = items.find((i) => i.type === "hotspot")
    if (hotspot) {
      setNearbyHotspot({ type: hotspot.hotspotType, label: hotspot.label })
    } else {
      setNearbyHotspot(null)
    }
  }, [])

  const handleCollect = useCallback((value: number) => {
    setPoints((p) => {
      const next = p + value
      localStorage.setItem("pp_points", String(next))
      return next
    })
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.blueDark }}>
        <div className={styles.logoBlock}>
          <span className={styles.logoWord}>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)` }}
    >
      {/* Main game area */}
      <div
        className="w-full h-screen"
        onWheel={(e) => {
          e.preventDefault();
          const delta = e.deltaY;
          if (delta < 0) {
            // Scroll up - zoom in
            setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))));
          } else {
            // Scroll down - zoom out
            setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))));
          }
        }}
      >
        <IsoRoom
          room="Lobby"
          selfName={playerName}
          selfColor={playerColor}
          selfOutfit={outfit}
          zoom={zoom}
          onCollect={handleCollect}
          onInteractive={handleInteractive}
        />
      </div>

      {/* Top bar */}
      <div className="fixed top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <div className={styles.logoBlock}>
            <span className={styles.logoWord}>JAMES.DEV</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="flex items-center gap-2 px-3 rounded-lg border-2"
            style={{ background: palette.windowBg, borderColor: palette.border, height: 36 }}
          >
            <span className="text-xs font-bold" style={{ color: palette.textDark }}>
              Points
            </span>
            <div
              className="px-2 py-1 rounded-md border font-bold text-xs"
              style={{ background: palette.windowInner, borderColor: palette.border, color: palette.textDark }}
            >
              {points}
            </div>
          </div>
          <div
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 rounded-lg border-2"
            style={{
              background: palette.windowBg,
              borderColor: palette.border,
              height: 36,
              minWidth: 160,
              maxWidth: 220,
            }}
          >
            {/* Mini avatar indicator */}
            <div
              className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center"
              style={{ background: playerColor }}
            >
              <div className="w-2 h-2 rounded-full bg-white/80" />
            </div>
            <span
              className="text-xs font-bold text-center truncate"
              style={{ color: palette.textDark }}
            >
              {playerName}
            </span>
            <div className="w-5" aria-hidden="true" />
          </div>
          <Button
            onClick={() => {
              // Clear all session data
              localStorage.removeItem("pp_name")
              localStorage.removeItem("pp_avatar")
              localStorage.removeItem("pp_shirt")
              localStorage.removeItem("pp_pants")
              localStorage.removeItem("pp_hair")
              localStorage.removeItem("pp_points")
              router.push("/")
            }}
            className={styles.goButton}
            style={{ height: 36, minWidth: 80, fontSize: 12, padding: "0 12px" }}
          >
            Keluar
          </Button>
        </div>
      </div>

      {/* Interaction prompt */}
      {nearbyHotspot && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
          <div
            className="px-4 py-2 rounded-lg border-2 border-black text-sm font-bold animate-bounce"
            style={{
              background: `linear-gradient(180deg, ${palette.yellow} 0%, #f3b700 100%)`,
              boxShadow: "0 4px 0 rgba(0,0,0,0.25), inset 0 0 0 2px " + palette.yellowEdge,
              color: palette.textDark,
            }}
          >
            Tekan [E] untuk melihat {nearbyHotspot.label}
          </div>
        </div>
      )}

      {/* Controls help */}
      {showControls && (
        <div className="fixed bottom-4 left-4 z-30">
          <div
            className="p-3 rounded-lg border-2 text-xs"
            style={{
              background: palette.windowBg,
              borderColor: palette.border,
            }}
          >
            <div className="font-bold mb-1" style={{ color: palette.textDark }}>
              Kontrol
            </div>
            <div style={{ color: palette.textMuted }}>
              <div>WASD / Arrows - Bergerak</div>
              <div>Klik - Jalan ke titik</div>
              <div>E - Interaksi</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick action buttons - Desktop only */}
      <div className="fixed bottom-4 right-4 z-30 hidden md:flex flex-col gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
            className="w-9 h-9 rounded-md border-2 flex items-center justify-center font-bold text-lg"
            style={{ background: palette.blueLight, borderColor: palette.blueEdge, color: "#1e293b", boxShadow: "inset 0 0 0 2px #3b5f76" }}
          >
            −
          </button>
          <div
            className="w-16 h-9 rounded-md border-2 flex items-center justify-center text-xs font-bold"
            style={{ background: palette.windowBg, borderColor: palette.blueEdge, color: palette.textDark }}
          >
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
            className="w-9 h-9 rounded-md border-2 flex items-center justify-center font-bold text-lg"
            style={{ background: palette.blueLight, borderColor: palette.blueEdge, color: "#1e293b", boxShadow: "inset 0 0 0 2px #3b5f76" }}
          >
            +
          </button>
        </div>

        <button
          onClick={() => setShowControls((s) => !s)}
          className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg"
          style={{
            background: palette.windowBg,
            borderColor: palette.border,
          }}
          title="Toggle Controls"
        >
          ?
        </button>
      </div>

      {/* Mobile Controls Panel - Keyboard Background */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden">
        <div
          className="relative px-4 pt-4 pb-6 rounded-t-3xl border-t-4"
          style={{
            background: `linear-gradient(180deg, ${palette.windowInner} 0%, ${palette.windowBg} 100%)`,
            borderColor: palette.border,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
          }}
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* D-pad */}
            <div className="relative w-32 h-32">
              {/* D-pad base shadow */}
              <div
                className="absolute inset-0 rounded-full blur-md"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  transform: "scale(0.9) translateY(3px)",
                }}
              />
              
              {/* D-pad background */}
              <div
                className="absolute inset-0 rounded-full border-4"
                style={{
                  background: `linear-gradient(135deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "inset 0 0 15px rgba(255,255,255,0.3), 0 3px 10px rgba(0,0,0,0.3)",
                }}
              />
              
              {/* Up */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "w", bubbles: true }));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "w", bubbles: true }));
                }}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-t-xl border-3 active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.windowBg} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={palette.textDark}>
                  <path d="M10 5 L15 12 L5 12 Z" />
                </svg>
              </button>

              {/* Down */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "s", bubbles: true }));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "s", bubbles: true }));
                }}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-b-xl border-3 active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.windowBg} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={palette.textDark}>
                  <path d="M10 15 L15 8 L5 8 Z" />
                </svg>
              </button>

              {/* Left */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "a", bubbles: true }));
                }}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-l-xl border-3 active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.windowBg} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={palette.textDark}>
                  <path d="M5 10 L12 5 L12 15 Z" />
                </svg>
              </button>

              {/* Right */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new KeyboardEvent("keyup", { key: "d", bubbles: true }));
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-r-xl border-3 active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.windowBg} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={palette.textDark}>
                  <path d="M15 10 L8 5 L8 15 Z" />
                </svg>
              </button>

              {/* Center circle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-3"
                style={{ 
                  background: `radial-gradient(circle, ${palette.windowInner} 0%, ${palette.windowBg} 100%)`,
                  borderColor: palette.border,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            {/* Action Button (E key) */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true }));
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                window.dispatchEvent(new KeyboardEvent("keyup", { key: "e", bubbles: true }));
              }}
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl font-black shadow-xl active:scale-90 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${palette.green} 0%, #16a34a 100%)`,
                borderColor: "#fff",
                color: "white",
                boxShadow: "0 6px 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.5)",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              E
            </button>

            {/* Zoom controls */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
                className="w-12 h-12 rounded-lg border-3 flex items-center justify-center font-bold text-2xl active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.blueLight} 100%)`,
                  borderColor: palette.border,
                  color: palette.textDark,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                className="w-12 h-12 rounded-lg border-3 flex items-center justify-center font-bold text-2xl active:scale-90 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, #fff 0%, ${palette.blueLight} 100%)`,
                  borderColor: palette.border,
                  color: palette.textDark,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)",
                }}
              >
                −
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio modals */}
      {activeModal && <PortfolioModal type={activeModal.type} id={activeModal.id} onClose={() => setActiveModal(null)} />}
    </div>
  )
}
