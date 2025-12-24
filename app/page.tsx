"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import WindowFrame from "@/components/window-frame"
import styles from "@/styles/habbo.module.css"
import { palette } from "@/lib/palette"

const SHIRT_COLORS = [
  { id: "blue", color: "#3b82f6", name: "Ocean", icon: "🌊" },
  { id: "red", color: "#ef4444", name: "Ruby", icon: "💎" },
  { id: "green", color: "#22c55e", name: "Forest", icon: "🌲" },
  { id: "orange", color: "#f59e0b", name: "Sunset", icon: "🌅" },
  { id: "purple", color: "#8b5cf6", name: "Violet", icon: "🔮" },
  { id: "pink", color: "#ec4899", name: "Rose", icon: "🌸" },
  { id: "yellow", color: "#eab308", name: "Gold", icon: "⭐" },
  { id: "cyan", color: "#06b6d4", name: "Sky", icon: "☁️" },
]

const PANTS_COLORS = [
  { id: "black", color: "#2b2b2b", name: "Charcoal", icon: "⬛" },
  { id: "denim", color: "#1d4ed8", name: "Denim", icon: "👖" },
  { id: "olive", color: "#4d7c0f", name: "Olive", icon: "🫒" },
  { id: "khaki", color: "#b69b6d", name: "Khaki", icon: "🏜️" },
  { id: "gray", color: "#6b7280", name: "Slate", icon: "🪨" },
  { id: "brown", color: "#78350f", name: "Earth", icon: "🌍" },
]

const HAIR_COLORS = [
  { id: "brown", color: "#5b3a1a", name: "Brown", icon: "🟤" },
  { id: "black", color: "#1f2937", name: "Black", icon: "⬛" },
  { id: "blonde", color: "#facc15", name: "Blonde", icon: "✨" },
  { id: "auburn", color: "#b45309", name: "Auburn", icon: "🍂" },
  { id: "silver", color: "#94a3b8", name: "Silver", icon: "🌙" },
  { id: "ginger", color: "#f97316", name: "Ginger", icon: "🦊" },
]

const SKIN_TONES = [
  { id: "fair", color: "#fde7d9", name: "Fair" },
  { id: "light", color: "#f5d5c1", name: "Light" },
  { id: "medium", color: "#e0b696", name: "Medium" },
  { id: "tan", color: "#c79b7a", name: "Tan" },
  { id: "brown", color: "#9b7355", name: "Brown" },
  { id: "dark", color: "#6d4c3d", name: "Dark" },
]

type MiniGame = "none" | "memory" | "rps" | "trivia"

export default function LandingPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [selectedColor, setSelectedColor] = useState("blue")
  const [pantsColor, setPantsColor] = useState("black")
  const [hairColor, setHairColor] = useState("brown")
  const [skinTone, setSkinTone] = useState("medium")
  const [isEntering, setIsEntering] = useState(false)
  const [activeGame, setActiveGame] = useState<MiniGame>("none")
  const [showCustomize, setShowCustomize] = useState(false)

  const handleEnter = () => {
    if (!playerName.trim()) return
    setIsEntering(true)
    localStorage.setItem("pp_name", playerName.trim())
    localStorage.setItem("pp_avatar", selectedColor)
    localStorage.setItem("pp_shirt", SHIRT_COLORS.find((c) => c.id === selectedColor)?.color || "#3b82f6")
    localStorage.setItem("pp_pants", PANTS_COLORS.find((c) => c.id === pantsColor)?.color || "#2b2b2b")
    localStorage.setItem("pp_hair", HAIR_COLORS.find((c) => c.id === hairColor)?.color || "#5b3a1a")
    localStorage.setItem("pp_skin", SKIN_TONES.find((s) => s.id === skinTone)?.color || "#e0b696")
    setTimeout(() => router.push("/game"), 400)
  }

  const selectedAvatarData = SHIRT_COLORS.find((a) => a.id === selectedColor)
  const selectedPants = PANTS_COLORS.find((p) => p.id === pantsColor)
  const selectedHair = HAIR_COLORS.find((h) => h.id === hairColor)
  const selectedSkin = SKIN_TONES.find((s) => s.id === skinTone)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-0 sm:p-4"
      style={{ background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)` }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-32 h-8 bg-white/60 rounded-full" />
        <div className="absolute top-16 left-[15%] w-20 h-6 bg-white/50 rounded-full" />
        <div className="absolute top-8 right-[20%] w-40 h-10 bg-white/55 rounded-full" />
        <div className="absolute top-20 right-[25%] w-24 h-7 bg-white/45 rounded-full" />
      </div>

      <div className="flex flex-col items-center justify-center w-full mx-auto">
        {/* Main entry window */}
        <WindowFrame
          title="Welcome to James.dev"
          initial={{ x: 0, y: 0, w: 340, h: undefined }}
          className="!static !transform-none w-full sm:max-w-md"
        >
          <div className={styles.windowBody}>
            {/* Logo */}
            <div className="flex justify-center pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className={styles.logoBlock} style={{ height: 40, padding: "0 16px" }}>
                <span className={styles.logoWord} style={{ fontSize: 18 }}>
                  JAMES.DEV
                </span>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm px-4 mb-3 sm:mb-4" style={{ color: palette.textDark }}>
              Interactive Portfolio Experience
            </p>

            <div className="px-6 mb-5">
              <label className="block text-sm font-bold mb-2" style={{ color: palette.textDark }}>
                Siapa Nama Kamu?
              </label>
              <div
                className="p-4 rounded-lg border-2"
                style={{
                  background: palette.windowInner,
                  borderColor: palette.border,
                }}
              >
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ketik nama kamu disini..."
                  maxLength={20}
                  className="h-14 text-lg font-bold text-center border-2 rounded-lg"
                  style={{
                    background: "#fff",
                    borderColor: palette.border,
                    color: palette.textDark,
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                />
                {playerName && (
                  <p className="text-center mt-2 text-sm" style={{ color: palette.green }}>
                    Hai, {playerName}! Pilih avatar kamu dibawah.
                  </p>
                )}
              </div>
            </div>

            {/* Mailing List Form - Show when name is entered */}
            {playerName && (
              <MailingListForm />
            )}

            {/* Customize Avatar Button */}
            {playerName && (
              <div className="px-6 mb-4">
                <Button
                  onClick={() => setShowCustomize(true)}
                  className={`${styles.pixelButton} w-full h-12 text-sm font-bold`}
                >
                  🎨 Customize Avatar
                </Button>
              </div>
            )}

            {/* Avatar preview */}
            <div className="flex justify-center mb-4">
              <div
                className="w-32 h-40 rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(180deg, ${palette.windowInner} 0%, ${palette.windowBg} 100%)` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                <AvatarPreview
                  color={selectedAvatarData?.color || "#3b82f6"}
                  pantsColor={selectedPants?.color || "#2b2b2b"}
                  hairColor={selectedHair?.color || "#5b3a1a"}
                  skinColor={selectedSkin?.color || "#e0b696"}
                />
              </div>
            </div>

            {/* Enter button */}
            <div className="px-6 pb-4">
              <Button
                onClick={handleEnter}
                disabled={!playerName.trim() || isEntering}
                className={`${styles.pixelButton} w-full h-14 text-base font-bold`}
              >
                {isEntering ? "Memasuki dunia..." : "Masuk Ke Dunia Saya"}
              </Button>
            </div>

            {/* Mini games buttons */}
            <div className="px-6 pb-4">
              <p className="text-xs font-bold mb-2 text-center" style={{ color: palette.textDark }}>
                Atau main dulu sebentar:
              </p>
              <div className="flex gap-2 justify-center">
                <MiniGameButton
                  label="Memory"
                  icon="🧠"
                  onClick={() => setActiveGame("memory")}
                  active={activeGame === "memory"}
                />
                <MiniGameButton
                  label="Suit"
                  icon="✊"
                  onClick={() => setActiveGame("rps")}
                  active={activeGame === "rps"}
                />
                <MiniGameButton
                  label="Trivia"
                  icon="❓"
                  onClick={() => setActiveGame("trivia")}
                  active={activeGame === "trivia"}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="px-6 pb-4">
              <div className={styles.navRow}>
                <div className={styles.navDot} />
                <span className="text-xs" style={{ color: palette.textMuted }}>
                  Jalan-jalan untuk explore • Tekan E untuk interaksi
                </span>
              </div>
            </div>
          </div>
        </WindowFrame>
      </div>

      {/* Customization Modal */}
      {showCustomize && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowCustomize(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-4"
            style={{
              background: palette.windowBg,
              borderColor: palette.border,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-4 border-b-2"
              style={{
                background: palette.blueLight,
                borderColor: palette.border,
              }}
            >
              <h2 className="text-lg font-bold" style={{ color: palette.textDark }}>
                🎨 Customize Avatar
              </h2>
              <button
                onClick={() => setShowCustomize(false)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold hover:scale-110 transition-transform"
                style={{
                  background: palette.red,
                  borderColor: palette.border,
                  color: "white",
                }}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Shirt Colors */}
              <div>
                <label className="block text-sm font-bold mb-3 text-center" style={{ color: palette.textDark }}>
                  👕 Warna Baju
                </label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {SHIRT_COLORS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedColor(avatar.id)}
                      className="relative w-14 h-14 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: avatar.color,
                        borderColor: selectedColor === avatar.id ? "#000" : "rgba(255,255,255,0.3)",
                        boxShadow:
                          selectedColor === avatar.id
                            ? "0 0 0 3px rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.4)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                        transform: selectedColor === avatar.id ? "scale(1.15)" : "scale(1)",
                      }}
                      title={avatar.name}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-2xl">
                        {avatar.icon}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedAvatarData && (
                  <p className="text-center text-xs mt-2 font-semibold" style={{ color: palette.textDark }}>
                    {selectedAvatarData.icon} {selectedAvatarData.name}
                  </p>
                )}
              </div>

              {/* Pants Colors */}
              <div>
                <label className="block text-sm font-bold mb-3 text-center" style={{ color: palette.textDark }}>
                  👖 Warna Celana
                </label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {PANTS_COLORS.map((pant) => (
                    <button
                      key={pant.id}
                      onClick={() => setPantsColor(pant.id)}
                      className="relative w-14 h-14 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: pant.color,
                        borderColor: pantsColor === pant.id ? "#000" : "rgba(255,255,255,0.3)",
                        boxShadow:
                          pantsColor === pant.id
                            ? "0 0 0 3px rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.4)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                        transform: pantsColor === pant.id ? "scale(1.15)" : "scale(1)",
                      }}
                      title={pant.name}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-lg">
                        {pant.icon}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedPants && (
                  <p className="text-center text-xs mt-2 font-semibold" style={{ color: palette.textDark }}>
                    {selectedPants.icon} {selectedPants.name}
                  </p>
                )}
              </div>

              {/* Hair Colors */}
              <div>
                <label className="block text-sm font-bold mb-3 text-center" style={{ color: palette.textDark }}>
                  💇 Warna Rambut
                </label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {HAIR_COLORS.map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => setHairColor(hair.id)}
                      className="relative w-14 h-14 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: hair.color,
                        borderColor: hairColor === hair.id ? "#000" : "rgba(255,255,255,0.3)",
                        boxShadow:
                          hairColor === hair.id
                            ? "0 0 0 3px rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.4)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                        transform: hairColor === hair.id ? "scale(1.15)" : "scale(1)",
                      }}
                      title={hair.name}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-lg">
                        {hair.icon}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedHair && (
                  <p className="text-center text-xs mt-2 font-semibold" style={{ color: palette.textDark }}>
                    {selectedHair.icon} {selectedHair.name}
                  </p>
                )}
              </div>

              {/* Skin Tones */}
              <div>
                <label className="block text-sm font-bold mb-3 text-center" style={{ color: palette.textDark }}>
                  🎨 Warna Kulit
                </label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {SKIN_TONES.map((skin) => (
                    <button
                      key={skin.id}
                      onClick={() => setSkinTone(skin.id)}
                      className="relative w-14 h-14 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: skin.color,
                        borderColor: skinTone === skin.id ? "#000" : "rgba(255,255,255,0.5)",
                        boxShadow:
                          skinTone === skin.id
                            ? "0 0 0 3px rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.4)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                        transform: skinTone === skin.id ? "scale(1.15)" : "scale(1)",
                      }}
                      title={skin.name}
                    />
                  ))}
                </div>
                {selectedSkin && (
                  <p className="text-center text-xs mt-2 font-semibold" style={{ color: palette.textDark }}>
                    {selectedSkin.name}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div className="flex justify-center pt-4">
                <div
                  className="w-32 h-40 rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(180deg, ${palette.windowInner} 0%, ${palette.windowBg} 100%)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                  <AvatarPreview
                    color={selectedAvatarData?.color || "#3b82f6"}
                    pantsColor={selectedPants?.color || "#2b2b2b"}
                    hairColor={selectedHair?.color || "#5b3a1a"}
                    skinColor={selectedSkin?.color || "#e0b696"}
                  />
                </div>
              </div>

              {/* Done Button */}
              <Button
                onClick={() => setShowCustomize(false)}
                className={`${styles.pixelButton} w-full h-12 text-base font-bold`}
              >
                ✓ Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mini game window */}
      {activeGame !== "none" && (
        <WindowFrame
          title={
            activeGame === "memory" ? "Memory Game" : activeGame === "rps" ? "Batu Gunting Kertas" : "Tech Trivia"
          }
          initial={{ 
            x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, 
            y: 80, 
            w: 380, 
            h: undefined 
          }}
          className="max-md:!fixed max-md:!bottom-4 max-md:!left-1/2 max-md:!-translate-x-1/2 max-md:!top-auto max-md:!w-[calc(100vw-2rem)] max-md:!max-w-md"
          onClose={() => setActiveGame("none")}
        >
          <div className={styles.windowBody}>
            {activeGame === "memory" && <MemoryGame />}
            {activeGame === "rps" && <RockPaperScissors />}
            {activeGame === "trivia" && <TechTrivia />}
          </div>
        </WindowFrame>
      )}
    </div>
  )
}

function MiniGameButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string
  icon: string
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 text-sm font-bold"
      style={{
        background: active ? `linear-gradient(180deg, ${palette.yellow} 0%, #f3b700 100%)` : palette.windowInner,
        borderColor: active ? "#000" : palette.border,
        color: palette.textDark,
      }}
    >
      <span className="mr-1">{icon}</span> {label}
    </button>
  )
}

// Memory Game Component
function MemoryGame() {
  const symbols = ["⚛️", "🔷", "🟢", "🔶", "💜", "❤️"]
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }))
    setCards(shuffled)
    setSelected([])
    setMoves(0)
    setWon(false)
  }

  const handleCardClick = (id: number) => {
    if (selected.length === 2) return
    if (cards[id].flipped || cards[id].matched) return

    const newCards = [...cards]
    newCards[id].flipped = true
    setCards(newCards)

    const newSelected = [...selected, id]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setMoves((m) => m + 1)
      const [first, second] = newSelected
      if (cards[first].symbol === cards[second].symbol) {
        setTimeout(() => {
          const matched = [...cards]
          matched[first].matched = true
          matched[second].matched = true
          setCards(matched)
          setSelected([])
          if (matched.every((c) => c.matched)) {
            setWon(true)
          }
        }, 300)
      } else {
        setTimeout(() => {
          const reset = [...cards]
          reset[first].flipped = false
          reset[second].flipped = false
          setCards(reset)
          setSelected([])
        }, 800)
      }
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold" style={{ color: palette.textDark }}>
          Moves: {moves}
        </span>
        <button
          onClick={resetGame}
          className="px-3 py-1 text-xs font-bold rounded border-2"
          style={{ background: palette.windowInner, borderColor: palette.border }}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className="w-16 h-16 rounded-lg border-2 text-2xl transition-all hover:scale-105"
            style={{
              background:
                card.flipped || card.matched
                  ? "#fff"
                  : `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)`,
              borderColor: card.matched ? palette.green : palette.border,
            }}
          >
            {card.flipped || card.matched ? card.symbol : "?"}
          </button>
        ))}
      </div>

      {won && (
        <div className="mt-4 p-3 rounded-lg text-center font-bold" style={{ background: palette.green, color: "#fff" }}>
          Selamat! Kamu menang dalam {moves} moves!
        </div>
      )}
    </div>
  )
}

// Rock Paper Scissors Component
function RockPaperScissors() {
  const choices = [
    { id: "rock", label: "Batu", emoji: "✊" },
    { id: "paper", label: "Kertas", emoji: "✋" },
    { id: "scissors", label: "Gunting", emoji: "✌️" },
  ]

  const [playerChoice, setPlayerChoice] = useState<string | null>(null)
  const [computerChoice, setComputerChoice] = useState<string | null>(null)
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null)
  const [score, setScore] = useState({ player: 0, computer: 0 })
  const [isPlaying, setIsPlaying] = useState(false)

  const play = (choice: string) => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayerChoice(choice)
    setResult(null)
    setComputerChoice(null)

    // Animate computer choice
    let count = 0
    const interval = setInterval(() => {
      setComputerChoice(choices[Math.floor(Math.random() * 3)].id)
      count++
      if (count > 10) {
        clearInterval(interval)
        const finalChoice = choices[Math.floor(Math.random() * 3)].id
        setComputerChoice(finalChoice)

        // Determine winner
        let res: "win" | "lose" | "draw"
        if (choice === finalChoice) {
          res = "draw"
        } else if (
          (choice === "rock" && finalChoice === "scissors") ||
          (choice === "paper" && finalChoice === "rock") ||
          (choice === "scissors" && finalChoice === "paper")
        ) {
          res = "win"
          setScore((s) => ({ ...s, player: s.player + 1 }))
        } else {
          res = "lose"
          setScore((s) => ({ ...s, computer: s.computer + 1 }))
        }
        setResult(res)
        setIsPlaying(false)
      }
    }, 100)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setScore({ player: 0, computer: 0 })
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold" style={{ color: palette.textDark }}>
          Kamu: {score.player} | Bot: {score.computer}
        </div>
        <button
          onClick={resetGame}
          className="px-3 py-1 text-xs font-bold rounded border-2"
          style={{ background: palette.windowInner, borderColor: palette.border }}
        >
          Reset
        </button>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => play(c.id)}
            disabled={isPlaying}
            className="w-20 h-20 rounded-lg border-2 text-3xl transition-all hover:scale-110 disabled:opacity-50"
            style={{
              background:
                playerChoice === c.id
                  ? `linear-gradient(180deg, ${palette.yellow} 0%, #f3b700 100%)`
                  : palette.windowInner,
              borderColor: playerChoice === c.id ? "#000" : palette.border,
            }}
          >
            {c.emoji}
          </button>
        ))}
      </div>

      {(playerChoice || computerChoice) && (
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl mb-1">{choices.find((c) => c.id === playerChoice)?.emoji || "?"}</div>
            <div className="text-xs font-bold" style={{ color: palette.textDark }}>
              Kamu
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: palette.textMuted }}>
            VS
          </div>
          <div className="text-center">
            <div className="text-4xl mb-1">{choices.find((c) => c.id === computerChoice)?.emoji || "?"}</div>
            <div className="text-xs font-bold" style={{ color: palette.textDark }}>
              Bot
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className="p-3 rounded-lg text-center font-bold"
          style={{
            background: result === "win" ? palette.green : result === "lose" ? "#ef4444" : palette.yellow,
            color: result === "draw" ? palette.textDark : "#fff",
          }}
        >
          {result === "win" ? "Kamu Menang! 🎉" : result === "lose" ? "Bot Menang! 😢" : "Seri! 🤝"}
        </div>
      )}
    </div>
  )
}

// Tech Trivia Component
function TechTrivia() {
  const questions = [
    {
      q: "Bahasa pemrograman apa yang dibuat oleh Brendan Eich dalam 10 hari?",
      options: ["Python", "JavaScript", "Ruby", "PHP"],
      answer: 1,
    },
    {
      q: "Framework React dibuat oleh perusahaan apa?",
      options: ["Google", "Microsoft", "Facebook/Meta", "Amazon"],
      answer: 2,
    },
    {
      q: "Apa kepanjangan dari CSS?",
      options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
      answer: 1,
    },
    {
      q: "Next.js adalah framework untuk?",
      options: ["Python", "PHP", "React", "Vue"],
      answer: 2,
    },
    {
      q: "Git diciptakan oleh siapa?",
      options: ["Bill Gates", "Steve Jobs", "Linus Torvalds", "Mark Zuckerberg"],
      answer: 2,
    },
  ]

  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleSelect = (index: number) => {
    if (showAnswer) return
    setSelected(index)
    setShowAnswer(true)
    if (index === questions[currentQ].answer) {
      setScore((s) => s + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1)
      setSelected(null)
      setShowAnswer(false)
    } else {
      setFinished(true)
    }
  }

  const resetGame = () => {
    setCurrentQ(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <div className="text-xl font-bold mb-2" style={{ color: palette.textDark }}>
          Quiz Selesai!
        </div>
        <div className="text-lg mb-4" style={{ color: palette.textMuted }}>
          Skor: {score}/{questions.length}
        </div>
        <div
          className="p-3 rounded-lg mb-4 font-bold"
          style={{
            background: score >= 4 ? palette.green : score >= 2 ? palette.yellow : "#ef4444",
            color: score >= 2 && score < 4 ? palette.textDark : "#fff",
          }}
        >
          {score >= 4
            ? "Luar biasa! Kamu tech expert!"
            : score >= 2
              ? "Bagus! Terus belajar!"
              : "Yuk belajar lebih banyak!"}
        </div>
        <button
          onClick={resetGame}
          className="px-4 py-2 font-bold rounded border-2"
          style={{ background: palette.windowInner, borderColor: palette.border }}
        >
          Main Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold" style={{ color: palette.textDark }}>
          Pertanyaan {currentQ + 1}/{questions.length}
        </span>
        <span className="text-sm font-bold" style={{ color: palette.green }}>
          Skor: {score}
        </span>
      </div>

      <div
        className="p-3 rounded-lg mb-4 font-bold text-sm"
        style={{ background: palette.windowInner, color: palette.textDark }}
      >
        {questions[currentQ].q}
      </div>

      <div className="space-y-2 mb-4">
        {questions[currentQ].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="w-full p-3 rounded-lg border-2 text-left text-sm font-bold transition-all"
            style={{
              background: showAnswer
                ? i === questions[currentQ].answer
                  ? palette.green
                  : selected === i
                    ? "#ef4444"
                    : palette.windowInner
                : selected === i
                  ? palette.yellow
                  : palette.windowInner,
              borderColor: palette.border,
              color: showAnswer && (i === questions[currentQ].answer || selected === i) ? "#fff" : palette.textDark,
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {showAnswer && (
        <button onClick={nextQuestion} className={`${styles.pixelButton} w-full h-10 text-sm font-bold`}>
          {currentQ < questions.length - 1 ? "Pertanyaan Selanjutnya" : "Lihat Hasil"}
        </button>
      )}
    </div>
  )
}

function AvatarPreview({ color, pantsColor, hairColor, skinColor }: { color: string; pantsColor: string; hairColor: string; skinColor: string }) {
  return (
    <svg viewBox="0 0 32 48" width={80} height={120} style={{ imageRendering: "pixelated" }}>
      {/* Shadow */}
      <ellipse cx="16" cy="46" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
      {/* Legs */}
      <rect x="8" y="36" width="6" height="8" fill={darken(pantsColor, 8)} />
      <rect x="18" y="36" width="6" height="8" fill={darken(pantsColor, 8)} />
      {/* Shoes */}
      <rect x="7" y="42" width="8" height="4" fill={darken(pantsColor, 25)} />
      <rect x="17" y="42" width="8" height="4" fill={darken(pantsColor, 25)} />
      {/* Body/Shirt */}
      <rect x="6" y="20" width="20" height="18" rx="3" fill={color} />
      {/* Collar */}
      <rect x="10" y="20" width="12" height="3" fill="#fff" />
      <rect x="10" y="23" width="12" height="2" fill="#cbd5e1" />
      {/* Arms */}
      <rect x="2" y="22" width="6" height="14" rx="2" fill={skinColor} />
      <rect x="24" y="22" width="6" height="14" rx="2" fill={skinColor} />
      {/* Head */}
      <circle cx="16" cy="12" r="10" fill={skinColor} />
      {/* Hair */}
      <rect x="6" y="3" width="20" height="8" rx="4" fill={hairColor} />
      <rect x="6" y="8" width="20" height="4" fill={hairColor} />
      {/* Eyes */}
      <circle cx="12" cy="12" r="2" fill="#1a1a1a" />
      <circle cx="20" cy="12" r="2" fill="#1a1a1a" />
      {/* Eye shine */}
      <circle cx="12.5" cy="11.5" r="0.8" fill="#fff" />
      <circle cx="20.5" cy="11.5" r="0.8" fill="#fff" />
      {/* Smile */}
      <path d="M13 16 Q16 18 19 16" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function lighten(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function darken(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Mailing List Form Component
function MailingListForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError("Nama dan email harus diisi")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        const data = await response.json()
        setError(data.error || "Gagal mendaftar")
      }
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="px-6 mb-4">
        <div
          className="p-4 rounded-lg border-2 text-center"
          style={{
            background: palette.green,
            borderColor: palette.border,
            color: "#fff",
          }}
        >
          ✓ Terima kasih! Anda telah terdaftar di mailing list.
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 mb-4">
      <div
        className="p-4 rounded-lg border-2"
        style={{
          background: palette.windowInner,
          borderColor: palette.border,
        }}
      >
        <p className="text-sm font-bold mb-3 text-center" style={{ color: palette.textDark }}>
          📬 Daftar Mailing List untuk Update Portfolio!
        </p>
        
        <div className="space-y-2">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nama Lengkap"
            className="h-10 text-sm border-2 rounded-md"
            style={{
              background: "#fff",
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="h-10 text-sm border-2 rounded-md"
            style={{
              background: "#fff",
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Nomor Telepon (opsional)"
            className="h-10 text-sm border-2 rounded-md"
            style={{
              background: "#fff",
              borderColor: palette.border,
              color: palette.textDark,
            }}
          />
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`${styles.pixelButton} w-full h-10 text-sm font-bold`}
          >
            {isSubmitting ? "Mendaftar..." : "Daftar Sekarang"}
          </Button>
          
          {error && (
            <p className="text-xs text-center" style={{ color: palette.red }}>
              {error}
            </p>
          )}
          
          <p className="text-xs text-center" style={{ color: palette.textMuted }}>
            Lewati jika tidak ingin mendaftar
          </p>
        </div>
      </div>
    </div>
  )
}

