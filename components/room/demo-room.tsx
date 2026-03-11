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
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Lock, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const MOCK_GOAL = "Review data structures and algorithms"
const MOCK_TITLE = "Computer Science"
const MOCK_STARTED_AT = new Date().toISOString()
const MOCK_DURATION = 60
const MOCK_MEMBERS = [
  { id: "1", name: "You",  focusState: "on-task" as const },
  { id: "2", name: "Alex", focusState: "on-task" as const },
  { id: "3", name: "Sam",  focusState: "on-task" as const },
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

const SIMULATE_OPTIONS: { value: FocusState; label: string; emoji: string }[] = [
  { value: "on-task",        label: "On Task",  emoji: "🟢" },
  { value: "warning",        label: "Warning",  emoji: "🟡" },
  { value: "locked",         label: "Locked",   emoji: "🔴" },
  { value: "approved-break", label: "On Break", emoji: "🔵" },
]

export function DemoRoom() {
  const [messages, setMessages] = useState<DemoMessage[]>(() => [
    { id: "1", user_id: "2", content: "joined the room",     type: "system",  created_at: new Date(Date.now() - 120000).toISOString(), displayName: "Alex" },
    { id: "2", user_id: "3", content: "joined the room",     type: "system",  created_at: new Date(Date.now() - 60000).toISOString(),  displayName: "Sam"  },
    { id: "3", user_id: "2", content: "Ready to focus! 📚",  type: "message", created_at: new Date(Date.now() - 45000).toISOString(), displayName: "Alex" },
    { id: "4", user_id: "3", content: "Let's crush this 🎯", type: "message", created_at: new Date(Date.now() - 20000).toISOString(), displayName: "Sam"  },
  ])
  const [focusState, setFocusState]       = useState<FocusState>("on-task")
  const [breakDialogOpen, setBreakDialogOpen] = useState(false)
  const [myRequestPending, setMyRequestPending] = useState(false)
  const userId = "1"

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch("/api/activity/state")
        if (!cancelled && res.ok) {
          const data = await res.json()
          if (data.focusState) setFocusState(data.focusState)
        }
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const sendMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), user_id: userId, content, type: "message", created_at: new Date().toISOString(), displayName: "You" },
    ])
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background relative">

      {/* Subtle animated room background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl animate-blob-1" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl animate-blob-2" />
      </div>

      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Lock className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">LockIn</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <CheckFocusButton onFocusUpdate={setFocusState} />
            <TabSearchButton />
            <DomainListsButtons />

            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs h-8")}>
                Simulate
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-card/90 backdrop-blur-md border-border/40">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Focus state
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SIMULATE_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setFocusState(opt.value)}
                    className={`gap-2 text-xs cursor-pointer ${focusState === opt.value ? "font-semibold bg-accent" : ""}`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                    {focusState === opt.value && <span className="ml-auto text-primary text-[10px]">active</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container max-w-5xl mx-auto px-4 py-6 flex-1 space-y-5">

        {/* Room header — no card wrapper */}
        <div className="animate-fade-in-up">
          <RoomHeader
            topicName={MOCK_TITLE}
            topicIcon="💻"
            startedAt={MOCK_STARTED_AT}
            durationMinutes={MOCK_DURATION}
            joinCode={null}
            mode="public"
            memberCount={3}
          />
        </div>

        {/* Status banners */}
        {focusState === "warning" && (
          <div className="animate-slide-down">
            <WarningBanner />
          </div>
        )}

        {focusState === "locked" && !myRequestPending && (
          <div
            className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-rose-500/25 bg-rose-500/6 px-4 py-3 animate-slide-down"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Session locked — you&apos;re on a blocked site</p>
                <p className="text-xs text-muted-foreground">Return to an allowed site to unlock, or request a break.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              onClick={() => setBreakDialogOpen(true)}
            >
              Request break
            </Button>
          </div>
        )}

        {myRequestPending && (
          <div className="rounded-xl border border-sky-500/25 bg-sky-500/6 px-4 py-3 animate-slide-down">
            <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">
              ⏳ Break request pending — waiting for a reviewer (demo: no reviewers online).
            </p>
          </div>
        )}

        {/* Room grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

          {/* Left column */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold tracking-tight">Study Room</h2>
              <FocusStatusBadge state={focusState} />
            </div>

            {/* Session goal — no card, just floating */}
            <SessionGoalCard title={MOCK_TITLE} goal={MOCK_GOAL} />

            {/* Chat panel — glass, no heavy card */}
            <div
              className="rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm flex flex-col overflow-hidden"
              style={{ height: 420 }}
            >
              <div className="flex-1 flex flex-col pt-4 pb-3 px-4 overflow-hidden">
                <ChatPanel
                  messages={messages}
                  loading={false}
                  userId={userId}
                  onSend={sendMessage}
                  displayName="You"
                />
              </div>
            </div>
          </div>

          {/* Right column — members, no card */}
          <div
            className="rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-4 h-fit animate-fade-in-right"
            style={{ animationDelay: "150ms" }}
          >
            <MemberList
              members={MOCK_MEMBERS.map((m) => ({
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
        onSubmit={() => {
          setMyRequestPending(true)
          setBreakDialogOpen(false)
          toast.success("Break requested (demo)")
        }}
      />
    </div>
  )
}
