"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import WindowFrame from "@/components/window-frame"
import styles from "@/styles/habbo.module.css"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm James Timothy's AI assistant. Ask me anything about his projects, skills, or experience!",
        },
      ])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Filter welcome message dari history (hanya kirim real conversation)
      const conversationHistory = messages.filter(
        (m) =>
          !(
            m.role === "assistant" &&
            m.content.includes("I'm James Timothy's AI assistant")
          )
      )

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
      setRemaining(data.remaining)
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${error.message}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating chat button - Simple SVG Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 md:bottom-6 md:right-6 md:left-auto z-50 group"
          title="Chat with AI Assistant"
          style={{
            width: "56px",
            height: "56px",
          }}
        >
          {/* Simple SVG Icon with shadow */}
          <img 
            src="/icon-chat.svg" 
            alt="Chat" 
            className="w-full h-full transition-all group-hover:scale-110 drop-shadow-lg"
          />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <WindowFrame
          title="🤖 AI Assistant Chat"
          initial={{
            x: typeof window !== "undefined" ? window.innerWidth - 420 : 800,
            y: 80,
            w: 380,
            h: 500,
          }}
          className="max-md:!fixed max-md:!bottom-0 max-md:!left-0 max-md:!right-0 max-md:!top-auto max-md:!w-full max-md:!h-[80vh] max-md:!translate-x-0"
          onClose={() => setIsOpen(false)}
        >
          <div className={`${styles.windowBody} flex flex-col h-full`}>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t p-3 bg-gray-50">
              {remaining !== null && (
                <p className="text-xs text-gray-500 mb-2">
                  {remaining} messages remaining this hour
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </WindowFrame>
      )}
    </>
  )
}
