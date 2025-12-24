"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { projectIso, unprojectIso, type IsoProjectParams } from "@/lib/iso"
import { aStar } from "@/lib/pathfinding"
import { palette } from "@/lib/palette"
import type { HotspotType } from "@/lib/types"

export type RoomPreset = "Lobby" | "Café" | "Rooftop"

type Grid = { cols: number; rows: number; walkable: boolean[] }
function idx(x: number, y: number, cols: number) {
  return y * cols + x
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function computeCenteredOrigin(w: number, h: number, cols: number, rows: number, tileW: number, tileH: number) {
  const hw = tileW / 2,
    hh = tileH / 2
  const corners = [
    { px: (0 - 0) * hw, py: (0 + 0) * hh },
    { px: (cols - 1 - 0) * hw, py: (cols - 1 + 0) * hh },
    { px: (0 - (rows - 1)) * hw, py: (0 + (rows - 1)) * hh },
    { px: (cols - 1 - (rows - 1)) * hw, py: (cols - 1 + (rows - 1)) * hh },
  ]
  const minX = Math.min(...corners.map((c) => c.px - hw))
  const maxX = Math.max(...corners.map((c) => c.px + hw))
  const minY = Math.min(...corners.map((c) => c.py))
  const maxY = Math.max(...corners.map((c) => c.py + tileH))
  const originX = Math.round(w / 2 - (minX + maxX) / 2)
  const originY = Math.round(h / 2 - (minY + maxY) / 2) - 6
  return { x: originX, y: originY }
}

type Hotspot = {
  id: string
  type: HotspotType
  x: number
  y: number
  radius: number
  label: string
}

// Portfolio hotspots (Lobby) - spread across 22x18 grid
const PORTFOLIO_HOTSPOTS: Hotspot[] = [
  { id: "computer", type: "skills", x: 6, y: 5, radius: 3, label: "Skills" },
  { id: "bookshelf", type: "projects", x: 15, y: 5, radius: 3, label: "Projects" },
  { id: "sofa", type: "about", x: 10, y: 12, radius: 3, label: "About Me" },
  { id: "board", type: "experience", x: 17, y: 12, radius: 3, label: "Experience" },
  { id: "mailbox", type: "contact", x: 5, y: 12, radius: 3, label: "Contact" },
]

// Back to Lobby hotspots for all rooms
const BACK_TO_LOBBY: Hotspot[] = [
  { id: "back", type: "about", x: 3, y: 9, radius: 2, label: "Back to Lobby" },
]

// Projects room hotspots (deprecated - using roomData instead)
const PROJECTS_HOTSPOTS: Hotspot[] = [
  ...BACK_TO_LOBBY,
]

// About room hotspots (deprecated - using roomData instead)
const ABOUT_HOTSPOTS: Hotspot[] = [
  ...BACK_TO_LOBBY,
]

type InteractiveItem = {
  type: "hotspot"
  id: string
  hotspotType: HotspotType
  label: string
  rect: { x: number; y: number; w: number; h: number }
}

type Props = {
  room?: RoomPreset
  selfName?: string
  selfColor?: string
  selfOutfit?: { shirt: string; pants: string; hair: string }
  zoom?: number
  roomData?: Hotspot[]
  onCollect?: (points: number) => void
  onInteractive?: (items: InteractiveItem[]) => void
}

type Avatar = { x: number; y: number; facing: "N" | "S" | "E" | "W" }

export default function IsoRoom({
  room = "Lobby",
  selfName = "You",
  selfColor = palette.avatarShirt,
  selfOutfit,
  zoom = 1,
  roomData,
  onCollect,
  onInteractive,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 300, h: 300 })
  const [avatar, setAvatar] = useState<Avatar>({ x: 8, y: 7, facing: "S" })
  const pathRef = useRef<{ nodes: { x: number; y: number }[]; progress: number } | null>(null)
  const animRef = useRef(0)
  const bgTimeRef = useRef(0)
  const heldDirRef = useRef<{ dx: number; dy: number; facing: "N" | "S" | "E" | "W" } | null>(null)

  const baseTileW = 54,
    baseTileH = 27
  const tileW = baseTileW * zoom
  const tileH = baseTileH * zoom
  const cols = 22,
    rows = 18

  const [collectibles, setCollectibles] = useState(
    [
      { id: "coin-1", x: 6, y: 6, value: 5 },
      { id: "coin-2", x: 9, y: 8, value: 5 },
      { id: "coin-3", x: 11, y: 5, value: 10 },
      { id: "coin-4", x: 14, y: 7, value: 5 },
      { id: "coin-5", x: 8, y: 14, value: 10 },
      { id: "coin-6", x: 13, y: 10, value: 5 },
      { id: "coin-7", x: 4, y: 11, value: 10 },
      { id: "coin-8", x: 16, y: 14, value: 5 },
      { id: "coin-9", x: 18, y: 8, value: 10 },
      { id: "coin-10", x: 12, y: 15, value: 10 },
    ] as { id: string; x: number; y: number; value: number }[],
  )

  // Build walkable grid
  const grid = useMemo<Grid>(() => {
    const walkable = new Array(cols * rows).fill(true)
    // Block walls
    for (let x = 0; x < cols; x++) {
      walkable[idx(x, 0, cols)] = false
      walkable[idx(x, rows - 1, cols)] = false
    }
    for (let y = 0; y < rows; y++) {
      walkable[idx(0, y, cols)] = false
      walkable[idx(cols - 1, y, cols)] = false
    }
    // Block some furniture
    const blocked = [
      [5, 3],
      [10, 3],
      [3, 9],
      [13, 9],
    ]
    blocked.forEach(([bx, by]) => {
      if (bx >= 0 && bx < cols && by >= 0 && by < rows) walkable[idx(bx, by, cols)] = false
    })
    return { cols, rows, walkable }
  }, [])

  // Resize
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      setSize({ w: Math.floor(cr.width), h: Math.floor(cr.height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Keyboard
  useEffect(() => {
    const keyMap: Record<string, { dx: number; dy: number; facing: "N" | "S" | "E" | "W" }> = {
      ArrowUp: { dx: 0, dy: -1, facing: "N" },
      w: { dx: 0, dy: -1, facing: "N" },
      W: { dx: 0, dy: -1, facing: "N" },
      ArrowDown: { dx: 0, dy: 1, facing: "S" },
      s: { dx: 0, dy: 1, facing: "S" },
      S: { dx: 0, dy: 1, facing: "S" },
      ArrowLeft: { dx: -1, dy: 0, facing: "W" },
      a: { dx: -1, dy: 0, facing: "W" },
      A: { dx: -1, dy: 0, facing: "W" },
      ArrowRight: { dx: 1, dy: 0, facing: "E" },
      d: { dx: 1, dy: 0, facing: "E" },
      D: { dx: 1, dy: 0, facing: "E" },
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        heldDirRef.current = dir
        pathRef.current = null
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.key]) heldDirRef.current = null
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  // Click to walk
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const origin = computeCenteredOrigin(size.w, size.h, cols, rows, tileW, tileH)
      const params: IsoProjectParams = { originX: origin.x, originY: origin.y, tileW, tileH }
      const { tx, ty } = unprojectIso(px, py, params)
      const cx = clamp(tx, 1, cols - 2)
      const cy = clamp(ty, 1, rows - 2)
      if (!grid.walkable[idx(cx, cy, cols)]) return
      const start = { x: Math.round(avatar.x), y: Math.round(avatar.y) }
      const end = { x: cx, y: cy }
      const path = aStar(start, end, grid, (gx, gy) => grid.walkable[idx(gx, gy, cols)])
      if (path.length > 1) pathRef.current = { nodes: path, progress: 0 }
    },
    [size.w, size.h, avatar.x, avatar.y, grid, tileW, tileH],
  )

  // Check hotspot proximity
  const checkHotspots = useCallback(() => {
    const items: InteractiveItem[] = []
    
    // Select hotspots based on room, merge with roomData if provided
    let hotspots = PORTFOLIO_HOTSPOTS
    if (room === "Rooftop") hotspots = PROJECTS_HOTSPOTS
    if (room === "Café") hotspots = ABOUT_HOTSPOTS
    
    // Add dynamic hotspots from roomData (but keep the "back" button)
    if (roomData) {
      hotspots = [...roomData, ...hotspots.filter((h) => h.label.toLowerCase().includes("back"))]
    }
    
    for (const h of hotspots) {
      const dx = avatar.x - h.x
      const dy = avatar.y - h.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < h.radius) {
        items.push({ type: "hotspot", id: h.id, hotspotType: h.type, label: h.label, rect: { x: 0, y: 0, w: 0, h: 0 } })
      }
    }

    // Collectibles
    setCollectibles((current) => {
      let changed = false
      const remaining = current.filter((c) => {
        const dx = avatar.x - c.x
        const dy = avatar.y - c.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.8) {
          changed = true
          onCollect?.(c.value)
          return false
        }
        return true
      })
      return changed ? remaining : current
    })

    onInteractive?.(items)
  }, [avatar.x, avatar.y, roomData, onInteractive, onCollect])

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let lastTime = performance.now()

    function loop(now: number) {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      const pr = pathRef.current
      const speedTilesPerSec = 3.4
      const moving = !!(pr && pr.nodes && pr.nodes.length > 1)
      animRef.current += dt * (moving ? 8 : 3)
      bgTimeRef.current += dt * 0.25

      // Movement
      if (moving && pr) {
        pr.progress += speedTilesPerSec * dt
        const maxProgress = pr.nodes.length - 1
        if (pr.progress >= maxProgress) {
          const last = pr.nodes[pr.nodes.length - 1]
          if (last) setAvatar((a) => ({ ...a, x: last.x, y: last.y }))
          pathRef.current = null
        } else {
          const segIndex = Math.min(Math.floor(pr.progress), pr.nodes.length - 2)
          const aNode = pr.nodes[segIndex]
          const bNode = pr.nodes[segIndex + 1]
          if (aNode && bNode) {
            const t = pr.progress - segIndex
            const x = aNode.x + (bNode.x - aNode.x) * t
            const y = aNode.y + (bNode.y - aNode.y) * t
            const facing =
              Math.abs(bNode.x - aNode.x) > Math.abs(bNode.y - aNode.y)
                ? bNode.x > aNode.x
                  ? "E"
                  : "W"
                : bNode.y > aNode.y
                  ? "S"
                  : "N"
            setAvatar((av) => ({ ...av, x, y, facing }))
          }
        }
      } else if (!moving && heldDirRef.current) {
        const { dx, dy, facing } = heldDirRef.current
        setAvatar((av) => {
          const nx = clamp(av.x + dx * speedTilesPerSec * dt, 1, cols - 2)
          const ny = clamp(av.y + dy * speedTilesPerSec * dt, 1, rows - 2)
          if (grid.walkable[idx(Math.round(nx), Math.round(ny), cols)]) {
            return { x: nx, y: ny, facing }
          }
          return { ...av, facing }
        })
      }

      checkHotspots()

      // Render
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== Math.floor(size.w * dpr) || canvas.height !== Math.floor(size.h * dpr)) {
        canvas.width = Math.floor(size.w * dpr)
        canvas.height = Math.floor(size.h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size.w, size.h)
      ctx.imageSmoothingEnabled = false

      // Background sky
      drawSky(ctx, size.w, size.h, bgTimeRef.current)
      drawClouds(ctx, size.w, bgTimeRef.current)

      const origin = computeCenteredOrigin(size.w, size.h, cols, rows, tileW, tileH)
      const params: IsoProjectParams = { originX: origin.x, originY: origin.y, tileW, tileH }

      // Floor tiles
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const { px, py } = projectIso(x, y, params)
          const isA = (x + y) % 2 === 0
          drawTile(ctx, px, py, tileW, tileH, isA ? palette.tileA : palette.tileB, "#000")
        }
      }

      // Walls
      drawWalls(ctx, grid, params, tileW, tileH)

      // Furniture
      drawPortfolioFurniture(ctx, params, tileW, tileH, animRef.current)

      // Collectibles visual
      collectibles.forEach((c, i) => {
        const { px, py } = projectIso(c.x, c.y, params)
        drawCollectible(ctx, px, py, animRef.current + i)
      })

      // Hotspot indicators
      let hotspots = PORTFOLIO_HOTSPOTS
      if (room === "Rooftop") hotspots = PROJECTS_HOTSPOTS
      if (room === "Café") hotspots = ABOUT_HOTSPOTS
      
      for (const h of hotspots) {
        const { px, py } = projectIso(h.x, h.y, params)
        const dx = avatar.x - h.x
        const dy = avatar.y - h.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const isNear = dist < h.radius
        drawHotspotIndicator(ctx, px, py - 40, h.label, isNear, animRef.current)
      }

      // Avatar
      const { px: ax, py: ay } = projectIso(avatar.x, avatar.y, params)
      const isMoving = !!pathRef.current || !!heldDirRef.current
      drawAvatar(
        ctx,
        ax,
        ay,
        tileW,
        tileH,
        avatar.facing,
        animRef.current,
        isMoving,
        selfOutfit?.shirt || selfColor,
        selfOutfit?.pants,
        selfOutfit?.hair,
      )

      // Nameplate
      ctx.font = "700 12px ui-sans-serif, system-ui"
      ctx.fillStyle = "rgba(255,255,255,0.95)"
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 3
      const textMetrics = ctx.measureText(selfName)
      const nameW = textMetrics.width + 16
      const paddedX = Math.max(8, Math.min(size.w - nameW - 8, ax - nameW / 2))
      const nameX = paddedX
      const nameY = ay - 48
      ctx.beginPath()
      ctx.roundRect(nameX, nameY, nameW, 18, 4)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "#111827"
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"
      ctx.fillText(selfName, nameX + nameW / 2, nameY + 9)
      ctx.textAlign = "start"
      ctx.textBaseline = "alphabetic"

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [size.w, size.h, selfName, selfColor, grid, checkHotspots, collectibles, zoom, selfOutfit])

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full cursor-pointer" />
    </div>
  )
}

// Drawing functions
function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  const phase = (Math.sin(t * 0.3) + 1) / 2
  g.addColorStop(0, `rgba(235,246,255,1)`)
  g.addColorStop(
    1,
    `rgba(${Math.round(150 + 25 * phase)}, ${Math.round(190 + 18 * phase)}, ${Math.round(215 + 8 * phase)}, 1)`,
  )
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawClouds(ctx: CanvasRenderingContext2D, w: number, t: number) {
  const clouds = 4
  for (let i = 0; i < clouds; i++) {
    const speed = 3 + i * 1.2
    const x = ((t * speed * 8) % (w + 260)) - 260 + i * 90
    const y = 30 + i * 16
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.roundRect(x, y, 110, 28, 14)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + 28, y + 11, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + 66, y + 9, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tileW: number,
  tileH: number,
  fill: string,
  stroke: string,
) {
  const hw = tileW / 2
  const hh = tileH / 2
  ctx.beginPath()
  ctx.moveTo(Math.round(px) + 0.5, Math.round(py) + 0.5)
  ctx.lineTo(Math.round(px + hw) + 0.5, Math.round(py + hh) + 0.5)
  ctx.lineTo(Math.round(px) + 0.5, Math.round(py) + Math.round(tileH) + 0.5)
  ctx.lineTo(Math.round(px - hw) + 0.5, Math.round(py + hh) + 0.5)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = stroke
  ctx.stroke()
}

function drawWalls(ctx: CanvasRenderingContext2D, grid: Grid, params: IsoProjectParams, tileW: number, tileH: number) {
  const { cols, rows } = grid
  const wallH = 50

  // Back wall (north)
  for (let x = 1; x < cols - 1; x++) {
    const { px, py } = projectIso(x, 1, params)
    const hw = tileW / 2
    const hh = tileH / 2

    // Left face
    ctx.fillStyle = palette.wallSide
    ctx.beginPath()
    ctx.moveTo(px - hw, py + hh)
    ctx.lineTo(px, py)
    ctx.lineTo(px, py - wallH)
    ctx.lineTo(px - hw, py + hh - wallH)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "#000"
    ctx.stroke()

    // Right face
    ctx.fillStyle = palette.wallTop
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + hw, py + hh)
    ctx.lineTo(px + hw, py + hh - wallH)
    ctx.lineTo(px, py - wallH)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  // Left wall (west)
  for (let y = 1; y < rows - 1; y++) {
    const { px, py } = projectIso(1, y, params)
    const hw = tileW / 2
    const hh = tileH / 2

    ctx.fillStyle = palette.wallTop
    ctx.beginPath()
    ctx.moveTo(px - hw, py + hh)
    ctx.lineTo(px, py)
    ctx.lineTo(px, py - wallH)
    ctx.lineTo(px - hw, py + hh - wallH)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "#000"
    ctx.stroke()
  }
}

function drawPortfolioFurniture(
  ctx: CanvasRenderingContext2D,
  params: IsoProjectParams,
  tileW: number,
  tileH: number,
  t: number,
) {
  // Computer (Skills) - moved to (6,5)
  const comp = projectIso(6, 5, params)
  drawDesk(ctx, comp.px, comp.py, tileW, tileH)

  // Bookshelf (Projects) - moved to (15,5)
  const shelf = projectIso(15, 5, params)
  drawBookshelf(ctx, shelf.px, shelf.py, tileW, tileH)

  // Sofa (About) - moved to (10,12)
  const sofa = projectIso(10, 12, params)
  drawSofa(ctx, sofa.px, sofa.py, tileW, tileH, "#ef4444")

  // Notice Board (Experience) - moved to (17,12)
  const board = projectIso(17, 12, params)
  drawNoticeBoard(ctx, board.px, board.py)

  // Mailbox (Contact) - moved to (5,12)
  const mail = projectIso(5, 12, params)
  drawMailbox(ctx, mail.px, mail.py)
}

function drawDesk(ctx: CanvasRenderingContext2D, px: number, py: number, tileW: number, tileH: number) {
  // Desk body
  ctx.fillStyle = palette.woodTop
  ctx.fillRect(px - 18, py - 10, 36, 16)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(px - 18, py - 10, 36, 16)

  // Monitor
  ctx.fillStyle = "#334155"
  ctx.fillRect(px - 12, py - 30, 24, 18)
  ctx.strokeRect(px - 12, py - 30, 24, 18)

  // Screen
  ctx.fillStyle = "#0ea5e9"
  ctx.fillRect(px - 10, py - 28, 20, 14)

  // Monitor stand
  ctx.fillStyle = "#334155"
  ctx.fillRect(px - 3, py - 12, 6, 4)
}

function drawBookshelf(ctx: CanvasRenderingContext2D, px: number, py: number, tileW: number, tileH: number) {
  // Shelf frame
  ctx.fillStyle = palette.woodSide
  ctx.fillRect(px - 16, py - 45, 32, 50)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(px - 16, py - 45, 32, 50)

  // Shelves
  ctx.fillStyle = palette.woodTop
  ctx.fillRect(px - 14, py - 30, 28, 3)
  ctx.fillRect(px - 14, py - 15, 28, 3)

  // Books
  const bookColors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]
  let bx = px - 12
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = bookColors[i]
    ctx.fillRect(bx, py - 43, 6, 12)
    bx += 7
  }
  bx = px - 10
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = bookColors[i + 1]
    ctx.fillRect(bx, py - 28, 8, 10)
    bx += 9
  }
}

function drawSofa(ctx: CanvasRenderingContext2D, px: number, py: number, tileW: number, tileH: number, color: string) {
  // Back
  ctx.fillStyle = shade(color, -15)
  ctx.fillRect(px - 24, py - 20, 48, 14)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(px - 24, py - 20, 48, 14)

  // Seat
  ctx.fillStyle = color
  ctx.fillRect(px - 24, py - 8, 48, 14)
  ctx.strokeRect(px - 24, py - 8, 48, 14)

  // Armrests
  ctx.fillStyle = shade(color, -20)
  ctx.fillRect(px - 28, py - 16, 6, 20)
  ctx.strokeRect(px - 28, py - 16, 6, 20)
  ctx.fillRect(px + 22, py - 16, 6, 20)
  ctx.strokeRect(px + 22, py - 16, 6, 20)
}

function drawNoticeBoard(ctx: CanvasRenderingContext2D, px: number, py: number) {
  // Frame
  ctx.fillStyle = "#8B4513"
  ctx.fillRect(px - 20, py - 35, 40, 35)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(px - 20, py - 35, 40, 35)

  // Cork board
  ctx.fillStyle = "#D4A574"
  ctx.fillRect(px - 17, py - 32, 34, 29)

  // Sticky notes
  ctx.fillStyle = "#FFEB3B"
  ctx.fillRect(px - 14, py - 28, 12, 10)
  ctx.fillStyle = "#4CAF50"
  ctx.fillRect(px - 1, py - 28, 12, 10)
  ctx.fillStyle = "#FF5722"
  ctx.fillRect(px + 12, py - 20, 8, 12)
}

function drawMailbox(ctx: CanvasRenderingContext2D, px: number, py: number) {
  // Post
  ctx.fillStyle = palette.woodSide
  ctx.fillRect(px - 3, py - 10, 6, 16)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(px - 3, py - 10, 6, 16)

  // Box
  ctx.fillStyle = "#ef4444"
  ctx.fillRect(px - 12, py - 30, 24, 22)
  ctx.strokeRect(px - 12, py - 30, 24, 22)

  // Flag
  ctx.fillStyle = "#22c55e"
  ctx.fillRect(px + 12, py - 28, 4, 12)

  // Slot
  ctx.fillStyle = "#1a1a1a"
  ctx.fillRect(px - 8, py - 22, 16, 3)
}

function drawHotspotIndicator(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  label: string,
  isNear: boolean,
  t: number,
) {
  const bounce = Math.sin(t * 2) * 3
  const y = py + bounce

  if (isNear) {
    ctx.shadowColor = palette.yellow
    ctx.shadowBlur = 15
    ctx.fillStyle = palette.yellow
    const textWidth = ctx.measureText(label).width
    const pillWidth = Math.max(textWidth + 20, 60)
    ctx.beginPath()
    ctx.roundRect(px - pillWidth / 2, y - 12, pillWidth, 24, 6)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = "#000"
    ctx.stroke()
    ctx.fillStyle = "#1a1a1a"
    ctx.font = "bold 11px ui-sans-serif, system-ui"
    ctx.textAlign = "center"
    ctx.fillText(label, px, y + 4)
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.beginPath()
    ctx.arc(px, y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#000"
    ctx.stroke()
  }
}

function drawCollectible(ctx: CanvasRenderingContext2D, px: number, py: number, t: number) {
  const bob = Math.sin(t * 4) * 4
  ctx.save()
  ctx.translate(px, py - 14 + bob)
  ctx.shadowColor = "rgba(255,215,0,0.7)"
  ctx.shadowBlur = 12
  ctx.fillStyle = "#fbbf24"
  ctx.beginPath()
  ctx.arc(0, 0, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = "#92400e"
  ctx.stroke()
  ctx.fillStyle = "#92400e"
  ctx.font = "bold 10px ui-sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("+", 0, 4)
  ctx.restore()
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  tileW: number,
  tileH: number,
  facing: "N" | "S" | "E" | "W",
  t: number,
  moving: boolean,
  shirtColor: string,
  pantsColor = "#2b2b2b",
  hairColor = "#5b3a1a",
) {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)"
  ctx.beginPath()
  ctx.ellipse(ax, ay + tileH * 0.6, tileW * 0.22, tileH * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()

  const walkSwing = Math.sin(t * 6) * (moving ? 3 : 1)
  const armSwing = Math.sin(t * 6 + Math.PI) * (moving ? 5 : 2)

  // Legs
  ctx.fillStyle = pantsColor
  ctx.fillRect(ax - 6, ay + 8 + walkSwing * -0.3, 6, 10)
  ctx.fillRect(ax + 1, ay + 8 + walkSwing * 0.3, 6, 10)
  ctx.strokeStyle = "#000"
  ctx.strokeRect(ax - 6, ay + 8 + walkSwing * -0.3, 6, 10)
  ctx.strokeRect(ax + 1, ay + 8 + walkSwing * 0.3, 6, 10)

  // Shoes
  ctx.fillStyle = shade(pantsColor, -20)
  ctx.fillRect(ax - 7, ay + 17 + walkSwing * -0.3, 8, 3)
  ctx.fillRect(ax + 0, ay + 17 + walkSwing * 0.3, 8, 3)

  // Body
  ctx.fillStyle = shirtColor
  ctx.beginPath()
  ctx.roundRect(ax - 10, ay - 18, 20, 26, 6)
  ctx.fill()
  ctx.strokeStyle = "#000"
  ctx.stroke()

  // Collar
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(ax - 6, ay - 18, 12, 3)
  ctx.fillStyle = "#cbd5e1"
  ctx.fillRect(ax - 6, ay - 15, 12, 2)

  // Arms
  ctx.fillStyle = palette.avatarHead
  ctx.beginPath()
  ctx.roundRect(ax - 13, ay - 12 + armSwing * -0.15, 6, 14, 3)
  ctx.fill()
  ctx.strokeStyle = "#000"
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(ax + 7, ay - 12 + armSwing * 0.15, 6, 14, 3)
  ctx.fill()
  ctx.stroke()

  // Head
  ctx.fillStyle = palette.avatarHead
  ctx.beginPath()
  ctx.arc(ax, ay - 26, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "#000"
  ctx.stroke()

  // Hair
  ctx.fillStyle = hairColor
  ctx.beginPath()
  ctx.roundRect(ax - 12, ay - 37, 24, 10, 6)
  ctx.fill()
  ctx.fillRect(ax - 12, ay - 32, 24, 5)

  // Face
  drawFace(ctx, facing, ax, ay - 26)
}

function drawFace(ctx: CanvasRenderingContext2D, facing: "N" | "S" | "E" | "W", cx: number, cy: number) {
  ctx.fillStyle = "#000"
  if (facing === "E") {
    dot(ctx, cx + 4, cy - 2)
    dot(ctx, cx + 7, cy + 1)
  } else if (facing === "W") {
    dot(ctx, cx - 4, cy - 2)
    dot(ctx, cx - 7, cy + 1)
  } else if (facing === "N") {
    dot(ctx, cx - 3, cy - 4)
    dot(ctx, cx + 3, cy - 4)
  } else {
    dot(ctx, cx - 3, cy - 1)
    dot(ctx, cx + 3, cy - 1)
  }

  // Smile
  ctx.strokeStyle = "#000"
  ctx.beginPath()
  ctx.moveTo(cx - 3, cy + 4)
  ctx.quadraticCurveTo(cx, cy + 6, cx + 3, cy + 4)
  ctx.stroke()
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.arc(Math.round(x) + 0.5, Math.round(y) + 0.5, 2, 0, Math.PI * 2)
  ctx.fill()
}

function shade(hex: string, percent: number) {
  const f = Number.parseInt(hex.slice(1), 16)
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  const R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff
  const newR = Math.round((t - R) * p) + R
  const newG = Math.round((t - G) * p) + G
  const newB = Math.round((t - B) * p) + B
  return "#" + (0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)
}
