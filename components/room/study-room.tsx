"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { RoomHeader } from "./room-header"
import { SessionGoalCard } from "./session-goal-card"
import { MemberList } from "./member-list"
import { ChatPanel } from "./chat-panel"
import { WarningBanner } from "./warning-banner"
import { BreakRequestDialog } from "./break-request-dialog"
import { FocusStatusBadge } from "./focus-status-badge"
import { CheckFocusButton } from "./check-focus-button"
import { TabSearchButton } from "./tab-search-button"
import { DomainListsButtons } from "./domain-lists-buttons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export type RoomMessage = {
  id: string
  user_id: string
  content: string
  type: "message" | "system"
  created_at: string
  displayName: string
}

type FocusState = "on-task" | "warning" | "locked" | "approved-break"

type MemberData = {
  id: string
  name: string
  focusState: FocusState
}

type StudyRoomProps = {
  roomId?: string
  roomName?: string
  roomTopic?: string
  messages?: RoomMessage[]
  members?: MemberData[]
  currentUserId?: string
  startedAt?: string
  durationMinutes?: number
  onSendMessage?: (content: string) => void | Promise<void>
  onLeaveRoom?: () => void | Promise<void>
}

const MOCK_MESSAGES: RoomMessage[] = [
  { id: "1", user_id: "2", content: "joined the room", type: "system", created_at: new Date(Date.now() - 120000).toISOString(), displayName: "Alex" },
  { id: "2", user_id: "3", content: "joined the room", type: "system", created_at: new Date(Date.now() - 60000).toISOString(), displayName: "Sam" },
  { id: "3", user_id: "2", content: "Ready to focus!", type: "message", created_at: new Date(Date.now() - 45000).toISOString(), displayName: "Alex" },
  { id: "4", user_id: "3", content: "Let's crush this", type: "message", created_at: new Date(Date.now() - 20000).toISOString(), displayName: "Sam" },
]

const MOCK_MEMBERS: MemberData[] = [
  { id: "1", name: "You", focusState: "on-task" },
  { id: "2", name: "Alex", focusState: "on-task" },
  { id: "3", name: "Sam", focusState: "on-task" },
]

export function StudyRoom({
  roomId,
  roomName,
  roomTopic,
  messages: externalMessages,
  members: externalMembers,
  currentUserId: externalUserId,
  startedAt: externalStartedAt,
  durationMinutes: externalDuration,
  onSendMessage,
  onLeaveRoom,
}: StudyRoomProps) {
  const [mockMessages, setMockMessages] = useState<RoomMessage[]>(MOCK_MESSAGES)
  const [focusState, setFocusState] = useState<FocusState>("on-task")
  const [breakDialogOpen, setBreakDialogOpen] = useState(false)
  const [myRequestPending, setMyRequestPending] = useState(false)

  const isLive = Boolean(roomId && externalMessages && externalUserId != null && onSendMessage)
  const messages = isLive ? (externalMessages ?? []) : mockMessages
  const userId = (isLive ? externalUserId : "1") ?? "1"
  const members = isLive ? (externalMembers ?? MOCK_MEMBERS) : MOCK_MEMBERS
  const startedAt = externalStartedAt ?? new Date().toISOString()
  const durationMinutes = externalDuration ?? 60

  const sendMessage = useCallback(
    (content: string) => {
      if (isLive && onSendMessage) { void onSendMessage(content); return }
      setMockMessages(prev => [
        ...prev,
        { id: String(Date.now()), user_id: "1", content, type: "message", created_at: new Date().toISOString(), displayName: "You" },
      ])
    },
    [isLive, onSendMessage]
  )

  useEffect(() => {
    if (isLive) return
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch("/api/activity/state")
        if (!cancelled && res.ok) { const data = await res.json(); if (data.focusState) setFocusState(data.focusState) }
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(t) }
  }, [isLive])

  const stateOpacity: Record<FocusState, string> = {
    "on-task": "bg-foreground",
    warning: "bg-foreground/60",
    locked: "bg-foreground/30",
    "approved-break": "bg-foreground/50",
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <div className={`h-px ${stateOpacity[focusState]} transition-colors duration-500`} />

      <header className="border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-11 flex items-center justify-between gap-3">
          <Link href={isLive ? "/home" : "/"} className="font-semibold text-xs tracking-tight hover:opacity-70 transition-opacity duration-200">
            grouplock
          </Link>
          <div className="flex items-center gap-1.5">
            {isLive && onLeaveRoom && (
              <Button variant="ghost" size="sm" className="rounded-sm gap-1 text-xs h-7" onClick={() => onLeaveRoom()}>
                <LogOut className="h-3 w-3" />Leave
              </Button>
            )}
            <CheckFocusButton onFocusUpdate={setFocusState} />
            <TabSearchButton />
            <DomainListsButtons />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 flex-1 w-full">

        <RoomHeader
          topicName={roomTopic ?? roomName ?? "Study Room"}
          topicIcon={null}
          startedAt={startedAt}
          durationMinutes={durationMinutes}
          joinCode={null}
          mode="public"
          memberCount={members.length}
        />

        {focusState === "warning" && (
          <div className="mt-3 animate-slide-down"><WarningBanner /></div>
        )}

        {focusState === "locked" && !myRequestPending && (
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap border border-foreground/20 rounded-sm bg-foreground/3 px-4 py-3 animate-slide-down">
            <div>
              <p className="text-sm font-semibold">Blocked — you&apos;re on a restricted site</p>
              <p className="text-xs text-muted-foreground">Return to an allowed site or request a break.</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-sm h-7 text-xs" onClick={() => setBreakDialogOpen(true)}>
              Request break
            </Button>
          </div>
        )}

        {myRequestPending && (
          <div className="mt-3 border border-foreground/15 rounded-sm bg-foreground/2 px-4 py-3 animate-slide-down">
            <p className="text-sm text-muted-foreground font-medium">Break request pending — waiting for approval.</p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_240px] mt-4">

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold tracking-tight">{roomName ?? "Study Room"}</h2>
              <FocusStatusBadge state={focusState} />
            </div>

            <SessionGoalCard title={roomTopic ?? roomName ?? "Study Room"} goal="Stay focused and get work done together" />

            <div className="border border-border rounded-sm bg-card/30 flex flex-col overflow-hidden" style={{ height: 420 }}>
              <div className="flex-1 flex flex-col pt-3 pb-2 px-3 overflow-hidden">
                <ChatPanel messages={messages} loading={false} userId={userId} onSend={sendMessage} displayName="You" />
              </div>
            </div>
          </div>

          <div className="border border-border rounded-sm p-3 h-fit lg:sticky lg:top-16">
            <MemberList
              members={members.map(m => ({
                id: m.id,
                name: m.name,
                focusState: m.id === userId ? focusState : m.focusState,
              }))}
              currentUserId={userId}
            />
          </div>
        </div>
      </div>

      <BreakRequestDialog
        open={breakDialogOpen}
        onOpenChange={setBreakDialogOpen}
        onSubmit={() => { setMyRequestPending(true); setBreakDialogOpen(false); toast.success("Break requested") }}
      />
    </div>
  )
}
