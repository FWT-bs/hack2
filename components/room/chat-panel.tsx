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

export function ChatPanel({ messages, loading, userId, onSend, displayName }: Props) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

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
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Chat</h3>
      <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
        <div className="space-y-2">
          {loading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-xs text-muted-foreground">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`text-sm ${msg.type === "system" ? "text-muted-foreground italic text-xs" : ""}`}>
              {msg.type === "system" ? (
                <span>{msg.displayName} {msg.content}</span>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-medium text-xs ${msg.user_id === userId ? "text-primary" : "text-foreground"}`}>
                      {msg.displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
          className="text-sm"
        />
        <Button size="icon" variant="ghost" onClick={handleSend} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
