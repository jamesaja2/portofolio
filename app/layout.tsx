import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import AIChatBot from "@/components/ai-chatbot"
import "./globals.css"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "James Timothy | Interactive Portfolio",
  description: "Full Stack Developer - Explore my portfolio in a unique pixel-art game experience",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.75,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <AIChatBot />
        <Analytics />
      </body>
    </html>
  )
}
