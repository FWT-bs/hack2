"use client"

import { useRef, useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { DemoMessage } from "./demo-room"

type Props = {
  messages: DemoMessage[]
  loading: boolean
  userId: string
  onSend: (content: string) => void
  displayName: string
}

const AVATAR_COLORS: Record<string, string> = {
  "1": "bg-primary",
  "2": "bg-indigo-500",
  "3": "bg-violet-500",
  "4": "bg-rose-500",
  "5": "bg-amber-500",
  "6": "bg-emerald-600",
}

function getAvatarColor(userId: string): string {
  return AVATAR_COLORS[userId] ?? "bg-primary"
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

export function ChatPanel({ messages, loading, userId, onSend }: Props) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Track which message IDs have been seen for per-message entrance animation
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Chat</h3>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <ScrollArea className="flex-1 pr-1" ref={scrollRef}>
        <div className="space-y-3 pb-2">
          {loading && (
            <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet — say hello! 👋
            </p>
          )}

          {messages.map((msg, idx) => {
            const isOwn   = msg.user_id === userId
            const isSystem = msg.type === "system"

            // Animate: stagger initial batch, instant for new messages
            const isNew = !seenIds.current.has(msg.id)
            if (isNew) seenIds.current.add(msg.id)
            const entryDelay = isNew && idx < 6 ? idx * 45 : 0
            const animStyle = isNew
              ? { animation: `chat-bubble-in 0.35s cubic-bezier(0.22,1,0.36,1) ${entryDelay}ms both` }
              : undefined

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center" style={animStyle}>
                  <span className="text-[10px] text-muted-foreground italic bg-muted/40 px-2.5 py-0.5 rounded-full">
                    {msg.displayName} {msg.content}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                style={animStyle}
              >
                {!isOwn && (
                  <div
                    className={`w-6 h-6 rounded-full ${getAvatarColor(msg.user_id)} flex items-center justify-center text-[9px] text-white font-bold shrink-0`}
                  >
                    {getInitials(msg.displayName)}
                  </div>
                )}

                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && (
                    <span className="text-[10px] font-semibold text-muted-foreground ml-1">
                      {msg.displayName}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-snug transition-all duration-200 hover:opacity-90 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/70 text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mx-1">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-2 pt-3 border-t border-border/30">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message…"
          onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
          className="text-sm rounded-xl h-9 bg-transparent border-border/40 focus:border-primary/50 transition-colors duration-200"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-9 w-9 rounded-xl shrink-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
