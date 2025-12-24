"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import styles from "@/styles/habbo.module.css"
import { palette } from "@/lib/palette"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(180deg, ${palette.blueLight} 0%, ${palette.blueDark} 100%)`,
      }}
    >
      <div
        className="max-w-2xl w-full p-8 rounded-lg border-4 text-center"
        style={{
          background: palette.windowBg,
          borderColor: palette.border,
          boxShadow: "0 8px 0 rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.3)",
        }}
      >
        {/* Logo Block */}
        <div className={styles.logoBlock}>
          <span className={styles.logoWord}>404</span>
        </div>

        {/* Pixel Art Sad Face */}
        <div className="my-8 flex justify-center">
          <div
            className="w-32 h-32 relative"
            style={{
              imageRendering: "pixelated",
            }}
          >
            {/* Simple pixel art sad face */}
            <svg viewBox="0 0 32 32" className="w-full h-full">
              {/* Face circle */}
              <circle cx="16" cy="16" r="14" fill={palette.yellow} stroke={palette.border} strokeWidth="2" />
              {/* Left eye */}
              <rect x="10" y="11" width="3" height="3" fill={palette.textDark} />
              {/* Right eye */}
              <rect x="19" y="11" width="3" height="3" fill={palette.textDark} />
              {/* Sad mouth */}
              <path
                d="M 10 22 Q 16 18 22 22"
                fill="none"
                stroke={palette.textDark}
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1
          className="text-2xl font-black mb-4 uppercase tracking-wider"
          style={{ color: palette.textDark }}
        >
          Page Not Found
        </h1>

        <p
          className="text-base mb-8 font-bold"
          style={{ color: palette.textMuted }}
        >
          Oops! The page you're looking for doesn't exist.
          <br />
          Maybe it got lost in the pixel world? 🎮
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              className="w-full sm:w-auto font-bold h-12 px-8 border-2 border-black text-base"
              style={{
                background: palette.yellow,
                color: palette.textDark,
              }}
            >
              🏠 Back to Home
            </Button>
          </Link>

          <Link href="/game">
            <Button
              className="w-full sm:w-auto font-bold h-12 px-8 border-2 border-black text-base"
              style={{
                background: palette.purple,
                color: "white",
              }}
            >
              🎮 Enter Game
            </Button>
          </Link>
        </div>

        {/* Fun Message */}
        <p
          className="mt-8 text-sm font-bold"
          style={{ color: palette.textMuted }}
        >
          Error Code: 404 | Status: Not Found
        </p>
      </div>
    </div>
  )
}
