"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Copy, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function RoomHeader({ topicName, topicIcon, startedAt, durationMinutes, joinCode, mode, memberCount }: Props) {
  const { formatted, progress, isExpired } = useSessionTimer(startedAt, durationMinutes)

  function copyCode() {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode)
      toast.success("Join code copied!")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm py-1 px-3">
            {topicIcon} {topicName}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {memberCount}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === "private" && joinCode && (
            <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5 font-mono text-xs">
              <Copy className="h-3 w-3" />
              {joinCode}
            </Button>
          )}
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${isExpired ? "text-destructive" : ""}`}>
            <Clock className="h-4 w-4" />
            {isExpired ? "Time's up!" : formatted}
          </div>
        </div>
      </div>
      <Progress value={progress * 100} className="h-1.5" />
    </div>
  )
}
