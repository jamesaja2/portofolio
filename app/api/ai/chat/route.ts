import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export const dynamic = "force-dynamic"

// Simple in-memory rate limiting (untuk production gunakan Redis)
const chatLimits = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = {
  MAX_REQUESTS: 10, // 10 messages per window
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
}

function getRateLimitKey(ip: string): string {
  return `chat:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const limit = chatLimits.get(key)

  if (!limit || now > limit.resetAt) {
    // Reset atau buat baru
    chatLimits.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT.WINDOW_MS,
    })
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1 }
  }

  if (limit.count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  limit.count++
  return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - limit.count }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    // Rate limiting berdasarkan IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          remaining: 0,
        },
        { status: 429 }
      )
    }

    const { message, history = [] } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Fetch portfolio context dari endpoint yang lebih ringkas
    const infoRes = await fetch(
      `${req.nextUrl.origin}/api/ai/portfolio-info`,
      { cache: "no-store" }
    )
    const portfolioInfo = await infoRes.text()

    // Initialize Gemini dengan API yang benar
    const ai = new GoogleGenAI({ apiKey })

    // Build conversation history
    const conversationHistory = history
      .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }))

    // Tambahkan system instruction & portfolio context di first message (lebih ringkas)
    let userMessage = message
    if (history.length === 0) {
      userMessage = `You are James Timothy's portfolio assistant. Answer based on this info:

${portfolioInfo}

Q: ${message}`
    }

    // Generate response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...conversationHistory,
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    })

    const responseText = response.text

    return NextResponse.json({
      response: responseText,
      remaining: rateLimit.remaining,
    })
  } catch (error: any) {
    console.error("Gemini AI error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process chat request",
        remaining: 0,
      },
      { status: 500 }
    )
  }
}
