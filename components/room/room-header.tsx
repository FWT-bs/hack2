"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Clock, Users } from "lucide-react"
import { useSessionTimer } from "@/hooks/use-session-timer"
import { toast } from "sonner"

type Props = {
  topicName: string
  topicIcon: string | null
  startedAt: string
  durationMinutes: number
  joinCode: string | null
  mode: string
  memberCount: number
}

export function RoomHeader({
  topicName,
  topicIcon,
  startedAt,
  durationMinutes,
  joinCode,
  mode,
  memberCount,
}: Props) {
  const { formatted, progress, isExpired } = useSessionTimer(startedAt, durationMinutes)

  function copyCode() {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode)
      toast.success("Join code copied!")
    }
  }

  return (
    /* No card — text and progress float directly */
    <div className="space-y-3 pb-2">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Topic + members */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{topicIcon}</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Study Room
              </p>
              <p className="font-bold text-base leading-tight">{topicName}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="gap-1.5 text-xs rounded-full bg-muted/60 text-muted-foreground border-0"
          >
            <Users className="h-3 w-3" />
            {memberCount} / 6
          </Badge>
        </div>

        {/* Timer + optional join code */}
        <div className="flex items-center gap-3">
          {mode === "private" && joinCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="gap-1.5 font-mono text-xs h-8 border-border/40"
            >
              <Copy className="h-3 w-3" />
              {joinCode}
            </Button>
          )}
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
              isExpired
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                : "bg-muted/50 border border-border/30"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono font-bold text-base tracking-tight">
              {isExpired ? "Time's up!" : formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={progress * 100} className="h-1 bg-muted/40" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Session started</span>
          <span>{Math.round(progress * 100)}% complete</span>
          <span>{durationMinutes} min</span>
        </div>
      </div>
    </div>
  )
}
