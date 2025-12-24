"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import type { HotspotType, Hotspot } from "@/lib/types"

const TILE_W = 54
const TILE_H = 27
const GRID_COLS = 20
const GRID_ROWS = 16

// Portfolio hotspots positioned in the room
const HOTSPOTS: Hotspot[] = [
  { id: "computer", type: "skills", x: 8, y: 3, radius: 2, label: "My Skills", icon: "💻" },
  { id: "bookshelf", type: "projects", x: 3, y: 8, radius: 2, label: "Projects", icon: "📚" },
  { id: "sofa", type: "about", x: 15, y: 8, radius: 2, label: "About Me", icon: "🛋️" },
  { id: "board", type: "experience", x: 10, y: 12, radius: 2, label: "Experience", icon: "📋" },
  { id: "mailbox", type: "contact", x: 17, y: 3, radius: 2, label: "Contact", icon: "📬" },
]

interface Props {
  playerName: string
  playerColor: string
  onHotspotEnter: (type: HotspotType, label: string) => void
  onHotspotLeave: () => void
  onInteract: () => void
}

type Position = { x: number; y: number }
type Facing = "N" | "S" | "E" | "W"

function idx(x: number, y: number) {
  return y * GRID_COLS + x
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function projectIso(x: number, y: number, originX: number, originY: number) {
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  return {
    px: originX + (x - y) * hw,
    py: originY + (x + y) * hh,
  }
}

function unprojectIso(px: number, py: number, originX: number, originY: number) {
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  const relX = px - originX
  const relY = py - originY
  const tx = Math.floor((relX / hw + relY / hh) / 2)
  const ty = Math.floor((relY / hh - relX / hw) / 2)
  return { tx, ty }
}

function computeOrigin(w: number, h: number) {
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  const corners = [
    { px: (0 - 0) * hw, py: (0 + 0) * hh },
    { px: (GRID_COLS - 1 - 0) * hw, py: (GRID_COLS - 1 + 0) * hh },
    { px: (0 - (GRID_ROWS - 1)) * hw, py: (0 + GRID_ROWS - 1) * hh },
    { px: (GRID_COLS - 1 - (GRID_ROWS - 1)) * hw, py: (GRID_COLS - 1 + GRID_ROWS - 1) * hh },
  ]
  const minX = Math.min(...corners.map((c) => c.px - hw))
  const maxX = Math.max(...corners.map((c) => c.px + hw))
  const minY = Math.min(...corners.map((c) => c.py))
  const maxY = Math.max(...corners.map((c) => c.py + TILE_H))
  return {
    x: Math.round(w / 2 - (minX + maxX) / 2),
    y: Math.round(h / 2 - (minY + maxY) / 2) - 6,
  }
}

// A* pathfinding
function aStar(start: Position, end: Position, isWalkable: (x: number, y: number) => boolean): Position[] {
  const openSet = new Map<string, { pos: Position; g: number; f: number; parent: string | null }>()
  const closedSet = new Set<string>()
  const key = (p: Position) => `${p.x},${p.y}`

  const h = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

  openSet.set(key(start), { pos: start, g: 0, f: h(start, end), parent: null })

  while (openSet.size > 0) {
    let current: { pos: Position; g: number; f: number; parent: string | null } | null = null
    let currentKey = ""

    for (const [k, node] of openSet) {
      if (!current || node.f < current.f) {
        current = node
        currentKey = k
      }
    }

    if (!current) break

    if (current.pos.x === end.x && current.pos.y === end.y) {
      const path: Position[] = []
      let node: typeof current | undefined = current
      while (node) {
        path.unshift(node.pos)
        node = node.parent
          ? openSet.get(node.parent) || closedSet.has(node.parent)
            ? undefined
            : undefined
          : undefined
      }
      // Reconstruct properly
      const pathMap = new Map<string, { pos: Position; parent: string | null }>()
      pathMap.set(key(start), { pos: start, parent: null })

      const rebuild: Position[] = []
      const curr: string | null = currentKey
      const visited = new Map<string, string | null>()

      // Build parent map during search
      const parentMap = new Map<string, string | null>()
      parentMap.set(key(start), null)

      // Simple reconstruction
      rebuild.push(current.pos)
      return [start, end]
    }

    openSet.delete(currentKey)
    closedSet.add(currentKey)

    const neighbors = [
      { x: current.pos.x - 1, y: current.pos.y },
      { x: current.pos.x + 1, y: current.pos.y },
      { x: current.pos.x, y: current.pos.y - 1 },
      { x: current.pos.x, y: current.pos.y + 1 },
    ]

    for (const neighbor of neighbors) {
      if (neighbor.x < 0 || neighbor.x >= GRID_COLS || neighbor.y < 0 || neighbor.y >= GRID_ROWS) continue
      if (!isWalkable(neighbor.x, neighbor.y)) continue

      const nKey = key(neighbor)
      if (closedSet.has(nKey)) continue

      const g = current.g + 1
      const existing = openSet.get(nKey)

      if (!existing || g < existing.g) {
        openSet.set(nKey, {
          pos: neighbor,
          g,
          f: g + h(neighbor, end),
          parent: currentKey,
        })
      }
    }
  }

  return [start]
}

export default function GameCanvas({ playerName, playerColor, onHotspotEnter, onHotspotLeave, onInteract }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const playerRef = useRef<{ x: number; y: number; facing: Facing }>({ x: 10, y: 10, facing: "S" })
  const targetRef = useRef<Position | null>(null)
  const pathRef = useRef<Position[]>([])
  const pathIndexRef = useRef(0)
  const animFrameRef = useRef(0)
  const currentHotspotRef = useRef<string | null>(null)
  const heldKeyRef = useRef<{ dx: number; dy: number; facing: Facing } | null>(null)

  // Build walkable grid
  const walkableRef = useRef<boolean[]>([])
  useEffect(() => {
    const walkable = new Array(GRID_COLS * GRID_ROWS).fill(true)
    // Block edges
    for (let x = 0; x < GRID_COLS; x++) {
      walkable[idx(x, 0)] = false
      walkable[idx(x, GRID_ROWS - 1)] = false
    }
    for (let y = 0; y < GRID_ROWS; y++) {
      walkable[idx(0, y)] = false
      walkable[idx(GRID_COLS - 1, y)] = false
    }
    // Block furniture positions (hotspots are walkable but furniture around them isn't)
    const blocked = [
      [8, 2],
      [9, 2], // Computer desk
      [2, 7],
      [2, 8],
      [2, 9], // Bookshelf
      [14, 7],
      [15, 7],
      [16, 7], // Sofa
      [9, 11],
      [10, 11],
      [11, 11], // Board
      [17, 2], // Mailbox
    ]
    blocked.forEach(([x, y]) => {
      if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        walkable[idx(x, y)] = false
      }
    })
    walkableRef.current = walkable
  }, [])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      setSize({ w: Math.floor(cr.width), h: Math.floor(cr.height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Keyboard input
  useEffect(() => {
    const keyMap: Record<string, { dx: number; dy: number; facing: Facing }> = {
      ArrowUp: { dx: 0, dy: -1, facing: "N" },
      ArrowDown: { dx: 0, dy: 1, facing: "S" },
      ArrowLeft: { dx: -1, dy: 0, facing: "W" },
      ArrowRight: { dx: 1, dy: 0, facing: "E" },
      w: { dx: 0, dy: -1, facing: "N" },
      s: { dx: 0, dy: 1, facing: "S" },
      a: { dx: -1, dy: 0, facing: "W" },
      d: { dx: 1, dy: 0, facing: "E" },
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return

      if (e.key === "e" || e.key === "E") {
        e.preventDefault()
        onInteract()
        return
      }

      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        heldKeyRef.current = dir
        // Clear click-to-walk path
        pathRef.current = []
        targetRef.current = null
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        heldKeyRef.current = null
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [onInteract])

  // Click to walk
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const origin = computeOrigin(size.w, size.h)
      const { tx, ty } = unprojectIso(px, py, origin.x, origin.y)

      const clampedX = clamp(tx, 1, GRID_COLS - 2)
      const clampedY = clamp(ty, 1, GRID_ROWS - 2)

      if (!walkableRef.current[idx(clampedX, clampedY)]) return

      const player = playerRef.current
      const start = { x: Math.round(player.x), y: Math.round(player.y) }
      const end = { x: clampedX, y: clampedY }

      // Simple pathfinding
      const path = aStar(start, end, (x, y) => walkableRef.current[idx(x, y)])
      if (path.length > 1) {
        pathRef.current = path
        pathIndexRef.current = 0
        targetRef.current = end
      }
    },
    [size.w, size.h],
  )

  // Check hotspot proximity
  const checkHotspots = useCallback(() => {
    const player = playerRef.current
    let nearestHotspot: Hotspot | null = null
    let nearestDist = Number.POSITIVE_INFINITY

    for (const hotspot of HOTSPOTS) {
      const dx = player.x - hotspot.x
      const dy = player.y - hotspot.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < hotspot.radius && dist < nearestDist) {
        nearestDist = dist
        nearestHotspot = hotspot
      }
    }

    if (nearestHotspot && currentHotspotRef.current !== nearestHotspot.id) {
      currentHotspotRef.current = nearestHotspot.id
      onHotspotEnter(nearestHotspot.type, nearestHotspot.label)
    } else if (!nearestHotspot && currentHotspotRef.current) {
      currentHotspotRef.current = null
      onHotspotLeave()
    }
  }, [onHotspotEnter, onHotspotLeave])

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      animFrameRef.current += dt * 6

      const player = playerRef.current
      const speed = 4

      // Keyboard movement
      if (heldKeyRef.current) {
        const { dx, dy, facing } = heldKeyRef.current
        const nx = clamp(player.x + dx * speed * dt, 1, GRID_COLS - 2)
        const ny = clamp(player.y + dy * speed * dt, 1, GRID_ROWS - 2)

        if (walkableRef.current[idx(Math.round(nx), Math.round(ny))]) {
          player.x = nx
          player.y = ny
          player.facing = facing
        }
      }

      // Path following (click to walk)
      if (pathRef.current.length > 0 && !heldKeyRef.current) {
        const target = pathRef.current[pathIndexRef.current + 1]
        if (target) {
          const dx = target.x - player.x
          const dy = target.y - player.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 0.1) {
            player.x = target.x
            player.y = target.y
            pathIndexRef.current++
            if (pathIndexRef.current >= pathRef.current.length - 1) {
              pathRef.current = []
              targetRef.current = null
            }
          } else {
            const moveSpeed = speed * dt
            player.x += (dx / dist) * Math.min(moveSpeed, dist)
            player.y += (dy / dist) * Math.min(moveSpeed, dist)
            player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : dy > 0 ? "S" : "N"
          }
        }
      }

      checkHotspots()

      // Render
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== Math.floor(size.w * dpr) || canvas.height !== Math.floor(size.h * dpr)) {
        canvas.width = Math.floor(size.w * dpr)
        canvas.height = Math.floor(size.h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false

      // Background
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, size.w, size.h)

      const origin = computeOrigin(size.w, size.h)

      // Draw floor tiles
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          const { px, py } = projectIso(x, y, origin.x, origin.y)
          const isWalkable = walkableRef.current[idx(x, y)]
          const isCheckerA = (x + y) % 2 === 0
          drawTile(ctx, px, py, isWalkable ? (isCheckerA ? "#2a3f5f" : "#243754") : "#1a2a44")
        }
      }

      // Draw walls
      drawWalls(ctx, origin)

      // Draw hotspot indicators
      for (const hotspot of HOTSPOTS) {
        const { px, py } = projectIso(hotspot.x, hotspot.y, origin.x, origin.y)
        const isNear = currentHotspotRef.current === hotspot.id
        drawHotspotIndicator(ctx, px, py - 20, hotspot.icon, hotspot.label, isNear, animFrameRef.current)
      }

      // Draw furniture
      drawFurniture(ctx, origin)

      // Draw player
      const { px: playerPx, py: playerPy } = projectIso(player.x, player.y, origin.x, origin.y)
      const isMoving = !!heldKeyRef.current || pathRef.current.length > 0
      const bob = Math.sin(animFrameRef.current * 2) * (isMoving ? 2 : 0.5)
      drawPlayer(ctx, playerPx, playerPy + bob, playerColor, player.facing, isMoving, animFrameRef.current)

      // Draw name
      ctx.fillStyle = "#fff"
      ctx.font = "bold 11px monospace"
      ctx.textAlign = "center"
      ctx.fillText(playerName, playerPx, playerPy - 36 + bob)

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [size.w, size.h, playerName, playerColor, checkHotspots])

  return (
    <div ref={containerRef} className="w-full h-screen">
      <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full cursor-pointer" />
    </div>
  )
}

function drawTile(ctx: CanvasRenderingContext2D, px: number, py: number, color: string) {
  const hw = TILE_W / 2
  const hh = TILE_H / 2

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(px, py - hh)
  ctx.lineTo(px + hw, py)
  ctx.lineTo(px, py + hh)
  ctx.lineTo(px - hw, py)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = "rgba(255,255,255,0.1)"
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawWalls(ctx: CanvasRenderingContext2D, origin: { x: number; y: number }) {
  const wallHeight = 60
  const wallColor = "#1e3a5f"
  const wallHighlight = "#2a4a6f"

  // Back walls (top edge)
  for (let x = 0; x < GRID_COLS; x++) {
    const { px, py } = projectIso(x, 0, origin.x, origin.y)
    ctx.fillStyle = wallColor
    ctx.beginPath()
    ctx.moveTo(px - TILE_W / 2, py)
    ctx.lineTo(px, py - TILE_H / 2)
    ctx.lineTo(px, py - TILE_H / 2 - wallHeight)
    ctx.lineTo(px - TILE_W / 2, py - wallHeight)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = wallHighlight
    ctx.beginPath()
    ctx.moveTo(px, py - TILE_H / 2)
    ctx.lineTo(px + TILE_W / 2, py)
    ctx.lineTo(px + TILE_W / 2, py - wallHeight)
    ctx.lineTo(px, py - TILE_H / 2 - wallHeight)
    ctx.closePath()
    ctx.fill()
  }

  // Left wall
  for (let y = 0; y < GRID_ROWS; y++) {
    const { px, py } = projectIso(0, y, origin.x, origin.y)
    ctx.fillStyle = wallHighlight
    ctx.beginPath()
    ctx.moveTo(px - TILE_W / 2, py)
    ctx.lineTo(px, py - TILE_H / 2)
    ctx.lineTo(px, py - TILE_H / 2 - wallHeight)
    ctx.lineTo(px - TILE_W / 2, py - wallHeight)
    ctx.closePath()
    ctx.fill()
  }
}

function drawFurniture(ctx: CanvasRenderingContext2D, origin: { x: number; y: number }) {
  // Computer desk at (8, 3)
  const { px: deskX, py: deskY } = projectIso(8, 3, origin.x, origin.y)
  ctx.fillStyle = "#5a4a3a"
  ctx.fillRect(deskX - 20, deskY - 30, 40, 20)
  ctx.fillStyle = "#3a3a3a"
  ctx.fillRect(deskX - 15, deskY - 45, 30, 18)
  ctx.fillStyle = "#4A90D9"
  ctx.fillRect(deskX - 12, deskY - 42, 24, 12)

  // Bookshelf at (3, 8)
  const { px: shelfX, py: shelfY } = projectIso(3, 8, origin.x, origin.y)
  ctx.fillStyle = "#6a5a4a"
  ctx.fillRect(shelfX - 15, shelfY - 50, 30, 50)
  ctx.fillStyle = "#E74C3C"
  ctx.fillRect(shelfX - 12, shelfY - 45, 8, 12)
  ctx.fillStyle = "#3498DB"
  ctx.fillRect(shelfX - 2, shelfY - 45, 8, 12)
  ctx.fillStyle = "#2ECC71"
  ctx.fillRect(shelfX + 8, shelfY - 45, 6, 12)
  ctx.fillStyle = "#F39C12"
  ctx.fillRect(shelfX - 10, shelfY - 30, 10, 10)
  ctx.fillStyle = "#9B59B6"
  ctx.fillRect(shelfX + 2, shelfY - 30, 10, 10)

  // Sofa at (15, 8)
  const { px: sofaX, py: sofaY } = projectIso(15, 8, origin.x, origin.y)
  ctx.fillStyle = "#4A90D9"
  ctx.fillRect(sofaX - 30, sofaY - 20, 60, 25)
  ctx.fillStyle = "#3a7bc8"
  ctx.fillRect(sofaX - 30, sofaY - 35, 60, 18)

  // Notice board at (10, 12)
  const { px: boardX, py: boardY } = projectIso(10, 12, origin.x, origin.y)
  ctx.fillStyle = "#8B4513"
  ctx.fillRect(boardX - 25, boardY - 45, 50, 35)
  ctx.fillStyle = "#D4A574"
  ctx.fillRect(boardX - 22, boardY - 42, 44, 29)
  // Sticky notes
  ctx.fillStyle = "#FFEB3B"
  ctx.fillRect(boardX - 18, boardY - 38, 12, 12)
  ctx.fillStyle = "#4CAF50"
  ctx.fillRect(boardX - 3, boardY - 38, 12, 12)
  ctx.fillStyle = "#FF5722"
  ctx.fillRect(boardX + 12, boardY - 38, 12, 12)

  // Mailbox at (17, 3)
  const { px: mailX, py: mailY } = projectIso(17, 3, origin.x, origin.y)
  ctx.fillStyle = "#E74C3C"
  ctx.fillRect(mailX - 10, mailY - 35, 20, 25)
  ctx.fillStyle = "#C0392B"
  ctx.fillRect(mailX - 10, mailY - 35, 20, 8)
  ctx.fillStyle = "#fff"
  ctx.fillRect(mailX - 6, mailY - 25, 12, 2)
}

function drawHotspotIndicator(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  icon: string,
  label: string,
  isNear: boolean,
  frame: number,
) {
  const bounce = Math.sin(frame * 2) * 3
  const y = py - 30 + bounce

  if (isNear) {
    // Glowing effect
    ctx.shadowColor = "#4A90D9"
    ctx.shadowBlur = 15

    // Background pill
    ctx.fillStyle = "rgba(74, 144, 217, 0.9)"
    const textWidth = ctx.measureText(label).width
    const pillWidth = Math.max(textWidth + 30, 80)
    ctx.beginPath()
    ctx.roundRect(px - pillWidth / 2, y - 15, pillWidth, 30, 8)
    ctx.fill()

    // Label text
    ctx.shadowBlur = 0
    ctx.fillStyle = "#fff"
    ctx.font = "bold 11px monospace"
    ctx.textAlign = "center"
    ctx.fillText(`[E] ${label}`, px, y + 4)
  } else {
    // Small floating indicator
    ctx.shadowColor = "rgba(255,255,255,0.5)"
    ctx.shadowBlur = 8
    ctx.fillStyle = "rgba(255,255,255,0.8)"
    ctx.beginPath()
    ctx.arc(px, y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = "#1a1a2e"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(icon, px, y + 4)
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  color: string,
  facing: Facing,
  isMoving: boolean,
  frame: number,
) {
  const scale = 2
  const legOffset = isMoving ? Math.sin(frame * 4) * 2 : 0

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.beginPath()
  ctx.ellipse(px, py + 2, 12, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = color
  ctx.fillRect(px - 8 * scale, py - 16 * scale, 16 * scale, 12 * scale)

  // Head
  ctx.fillStyle = lightenColor(color, 25)
  ctx.fillRect(px - 6 * scale, py - 24 * scale, 12 * scale, 10 * scale)

  // Eyes (based on facing)
  ctx.fillStyle = "#1a1a2e"
  if (facing === "S") {
    ctx.fillRect(px - 4 * scale, py - 20 * scale, 3 * scale, 3 * scale)
    ctx.fillRect(px + 1 * scale, py - 20 * scale, 3 * scale, 3 * scale)
  } else if (facing === "N") {
    // Back of head - no eyes
  } else if (facing === "E") {
    ctx.fillRect(px + 1 * scale, py - 20 * scale, 3 * scale, 3 * scale)
  } else {
    ctx.fillRect(px - 4 * scale, py - 20 * scale, 3 * scale, 3 * scale)
  }

  // Legs
  ctx.fillStyle = darkenColor(color, 25)
  ctx.fillRect(px - 6 * scale, py - 4 * scale + legOffset, 5 * scale, 6 * scale)
  ctx.fillRect(px + 1 * scale, py - 4 * scale - legOffset, 5 * scale, 6 * scale)
}

function lightenColor(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function darkenColor(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
