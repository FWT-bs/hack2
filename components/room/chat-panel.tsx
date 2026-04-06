"use client"

import { useRef, useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { RoomMessage } from "./study-room"

type Props = {
  messages: RoomMessage[]
  loading: boolean
  userId: string
  onSend: (content: string) => void
  displayName: string
}

export function ChatPanel({ messages, loading, userId, onSend }: Props) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  function handleSend() {
    const t = input.trim(); if (!t) return; onSend(t); setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Feed</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <ScrollArea className="flex-1 pr-1" ref={scrollRef}>
        <div className="space-y-2 pb-1">
          {loading && <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>}
          {!loading && messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No messages yet.</p>}

          {messages.map((msg, idx) => {
            const isOwn = msg.user_id === userId
            const isSystem = msg.type === "system"
            const isNew = !seenIds.current.has(msg.id)
            if (isNew) seenIds.current.add(msg.id)
            const anim = isNew
              ? { animation: `chat-bubble-in 0.25s cubic-bezier(0.22,1,0.36,1) ${isNew && idx < 6 ? idx * 30 : 0}ms both` }
              : undefined

            if (isSystem) {
              return (
                <div key={msg.id} className="flex items-center gap-2 py-0.5" style={anim}>
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                    {msg.displayName} {msg.content}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              )
            }

            return (
              <div key={msg.id} className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : ""}`} style={anim}>
                {!isOwn && (
                  <div className="w-5 h-5 rounded-sm bg-foreground/80 flex items-center justify-center text-[8px] text-background font-bold shrink-0">
                    {msg.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                  {!isOwn && <span className="text-[10px] font-medium text-muted-foreground ml-0.5">{msg.displayName}</span>}
                  <div className={`rounded-sm px-2.5 py-1.5 text-sm leading-snug ${
                    isOwn ? "bg-foreground text-background" : "bg-muted text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground mx-0.5 font-mono">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-2 pt-2 border-t border-border">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message..."
          onKeyDown={e => { if (e.key === "Enter") handleSend() }}
          className="text-sm rounded-sm h-8 bg-transparent border-border"
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="h-8 w-8 rounded-sm shrink-0">
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
