"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Copy, Clock, Users } from "lucide-react"
import { useSessionTimer } from "@/hooks/use-session-timer"
import { toast } from "sonner"

type Props = {
  topicName: string
  topicIcon?: string | null
  startedAt: string
  durationMinutes: number
  joinCode: string | null
  mode: string
  memberCount: number
}

export function RoomHeader({ topicName, topicIcon, startedAt, durationMinutes, joinCode, mode, memberCount }: Props) {
  const { formatted, progress, isExpired } = useSessionTimer(startedAt, durationMinutes)

  function copyCode() {
    if (joinCode) { navigator.clipboard.writeText(joinCode); toast.success("Join code copied!") }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {topicIcon && <span className="text-lg">{topicIcon}</span>}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Focus Room</p>
            <p className="font-semibold text-sm tracking-tight">{topicName}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-sm px-2 py-0.5">
            <Users className="h-3 w-3" />{memberCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mode === "private" && joinCode && (
            <Button variant="outline" size="sm" onClick={copyCode} className="gap-1 font-mono text-xs h-7 rounded-sm">
              <Copy className="h-3 w-3" />{joinCode}
            </Button>
          )}
          <div className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-sm font-semibold tabular-nums border ${
            isExpired ? "border-foreground/30 text-foreground/50" : "border-border bg-muted"
          }`}>
            <Clock className="h-3 w-3" />
            {isExpired ? "Done" : formatted}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress * 100} className="h-px bg-border" />
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Start</span>
          <span>{Math.round(progress * 100)}%</span>
          <span>{durationMinutes}m</span>
        </div>
      </div>
    </div>
  )
}
