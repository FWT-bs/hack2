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
import { DomainListsCard } from "./domain-lists-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const MOCK_GOAL = "Review data structures and algorithms"
const MOCK_TITLE = "CS Study"
const MOCK_STARTED_AT = new Date().toISOString()
const MOCK_DURATION = 60
const MOCK_MEMBERS = [
  { id: "1", name: "You", focusState: "on-task" as const },
  { id: "2", name: "Alex", focusState: "on-task" as const },
  { id: "3", name: "Sam", focusState: "on-task" as const },
]

export type DemoMessage = {
  id: string
  user_id: string
  content: string
  type: "message" | "system"
  created_at: string
  displayName: string
}

type FocusState = "on-task" | "warning" | "locked" | "approved-break"

export function DemoRoom() {
  const [messages, setMessages] = useState<DemoMessage[]>(() => [
    {
      id: "1",
      user_id: "2",
      content: "joined the room",
      type: "system",
      created_at: new Date(Date.now() - 60000).toISOString(),
      displayName: "Alex",
    },
    {
      id: "2",
      user_id: "3",
      content: "joined the room",
      type: "system",
      created_at: new Date(Date.now() - 30000).toISOString(),
      displayName: "Sam",
    },
    {
      id: "3",
      user_id: "2",
      content: "Ready to focus!",
      type: "message",
      created_at: new Date(Date.now() - 20000).toISOString(),
      displayName: "Alex",
    },
  ])
  const [focusState, setFocusState] = useState<FocusState>("on-task")
  const [breakDialogOpen, setBreakDialogOpen] = useState(false)
  const [myRequestPending, setMyRequestPending] = useState(false)
  const userId = "1"

  // Optional: poll API for focus state (when using extension)
  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch("/api/activity/state")
        if (!cancelled && res.ok) {
          const data = await res.json()
          if (data.focusState) setFocusState(data.focusState)
        }
      } catch {
        // ignore
      }
    }
    const t = setInterval(poll, 2000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const sendMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user_id: userId,
        content,
        type: "message",
        created_at: new Date().toISOString(),
        displayName: "You",
      },
    ])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity">
            LockIn
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <CheckFocusButton onFocusUpdate={setFocusState} />
            <TabSearchButton />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Simulate:</span>
              {(["on-task", "warning", "locked", "approved-break"] as const).map((s) => (
                <Button
                  key={s}
                  variant={focusState === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusState(s)}
                >
                  {s === "on-task" ? "On task" : s === "approved-break" ? "Break" : s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-6 space-y-4 flex-1">

      <RoomHeader
        topicName="Computer Science"
        topicIcon="💻"
        startedAt={MOCK_STARTED_AT}
        durationMinutes={MOCK_DURATION}
        joinCode={null}
        mode="public"
        memberCount={3}
      />

      {focusState === "warning" && <WarningBanner />}

      {focusState === "locked" && !myRequestPending && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">Session locked — you&apos;re on a blocked site</p>
                <p className="text-xs text-muted-foreground">The lock overlay is shown on the blocked tab. Return to an allowed site to unlock.</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setBreakDialogOpen(true)}>
              Request break
            </Button>
          </CardContent>
        </Card>
      )}

      {myRequestPending && (
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="py-4">
            <p className="text-sm">Your break request is pending. (Demo: no reviewer.)</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Study Room</h2>
            <FocusStatusBadge state={focusState} />
          </div>

          <SessionGoalCard title={MOCK_TITLE} goal={MOCK_GOAL} />

          <DomainListsCard />

          <Card className="h-[400px] flex flex-col rounded-xl border-border shadow-sm">
            <CardContent className="flex-1 flex flex-col pt-4">
              <ChatPanel
                messages={messages}
                loading={false}
                userId={userId}
                onSend={sendMessage}
                displayName="You"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border-border shadow-sm">
          <CardContent className="pt-4">
            <MemberList
              members={MOCK_MEMBERS.map((m) => ({
                id: m.id,
                name: m.name,
                focusState: m.id === userId ? focusState : m.focusState,
              }))}
              currentUserId={userId}
            />
          </CardContent>
        </Card>
      </div>

      <BreakRequestDialog
        open={breakDialogOpen}
        onOpenChange={setBreakDialogOpen}
        onSubmit={() => {
          setMyRequestPending(true)
          setBreakDialogOpen(false)
          toast.success("Break requested (demo)")
        }}
      />
      </div>
    </div>
  )
}
