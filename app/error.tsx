"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import styles from "@/styles/habbo.module.css"
import { palette } from "@/lib/palette"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
          <span className={styles.logoWord}>ERROR</span>
        </div>

        {/* Pixel Art Alert Icon */}
        <div className="my-8 flex justify-center">
          <div
            className="w-32 h-32 relative"
            style={{
              imageRendering: "pixelated",
            }}
          >
            <svg viewBox="0 0 32 32" className="w-full h-full">
              {/* Alert triangle */}
              <path
                d="M 16 2 L 30 28 L 2 28 Z"
                fill={palette.orange}
                stroke={palette.border}
                strokeWidth="2"
              />
              {/* Exclamation mark */}
              <rect x="14" y="10" width="4" height="10" fill={palette.textDark} />
              <rect x="14" y="22" width="4" height="4" fill={palette.textDark} />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1
          className="text-2xl font-black mb-4 uppercase tracking-wider"
          style={{ color: palette.textDark }}
        >
          Something Went Wrong!
        </h1>

        <p
          className="text-base mb-4 font-bold"
          style={{ color: palette.textMuted }}
        >
          Oops! An unexpected error occurred.
          <br />
          Don't worry, we can fix this! 🔧
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="mb-6 p-4 rounded text-left text-sm font-mono overflow-auto max-h-32"
            style={{
              background: "#1f2937",
              color: "#f87171",
            }}
          >
            {error.message || "Unknown error"}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="w-full sm:w-auto font-bold h-12 px-8 border-2 border-black text-base"
            style={{
              background: palette.green,
              color: "white",
            }}
          >
            🔄 Try Again
          </Button>

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
        </div>

        {/* Error Code */}
        {error.digest && (
          <p
            className="mt-8 text-xs font-bold"
            style={{ color: palette.textMuted }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
