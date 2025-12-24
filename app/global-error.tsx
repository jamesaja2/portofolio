"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GlobalError({
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
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "linear-gradient(180deg, #87ceeb 0%, #1e3a8a 100%)",
          }}
        >
          <div
            style={{
              maxWidth: "40rem",
              width: "100%",
              padding: "2rem",
              borderRadius: "0.5rem",
              border: "4px solid #2b2b2b",
              textAlign: "center",
              background: "#f5f5dc",
              boxShadow: "0 8px 0 rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.3)",
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: "900",
                marginBottom: "1rem",
                textTransform: "uppercase",
                color: "#2b2b2b",
                fontFamily: "monospace",
              }}
            >
              ⚠️ CRITICAL ERROR
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                marginBottom: "2rem",
                fontWeight: "bold",
                color: "#4a4a4a",
              }}
            >
              A critical error occurred. The application needs to restart.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  overflow: "auto",
                  maxHeight: "8rem",
                  background: "#1f2937",
                  color: "#f87171",
                }}
              >
                {error.message || "Unknown critical error"}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                onClick={reset}
                style={{
                  fontWeight: "bold",
                  height: "3rem",
                  padding: "0 2rem",
                  border: "2px solid black",
                  fontSize: "1rem",
                  background: "#22c55e",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                🔄 Restart App
              </Button>

              <Link href="/">
                <Button
                  style={{
                    fontWeight: "bold",
                    height: "3rem",
                    padding: "0 2rem",
                    border: "2px solid black",
                    fontSize: "1rem",
                    background: "#fbbf24",
                    color: "#2b2b2b",
                    cursor: "pointer",
                  }}
                >
                  🏠 Go Home
                </Button>
              </Link>
            </div>

            {error.digest && (
              <p
                style={{
                  marginTop: "2rem",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "#6b7280",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
