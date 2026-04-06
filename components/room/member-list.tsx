"use client"

import { FocusStatusBadge } from "./focus-status-badge"
import type { FocusState } from "@/types"

type Member = { id: string; name: string; focusState: FocusState }
type Props = { members: Member[]; currentUserId: string }

const STATUS_DOT: Record<FocusState, string> = {
  "on-task": "bg-foreground",
  warning: "bg-foreground/50 animate-pulse-slow",
  locked: "bg-foreground/30",
  "approved-break": "bg-foreground/40",
}

function avatarBg(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  const shades = ["bg-foreground/90", "bg-foreground/80", "bg-foreground/70", "bg-foreground/60"]
  return shades[Math.abs(h) % shades.length]
}

export function MemberList({ members, currentUserId }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Members</span>
        <span className="text-[10px] text-muted-foreground">{members.length}</span>
      </div>
      <div className="space-y-0.5">
        {members.map(m => {
          const isYou = m.id === currentUserId
          return (
            <div key={m.id} className={`flex items-center gap-2.5 rounded-sm px-2.5 py-2 transition-colors duration-200 ${isYou ? "bg-muted/60" : "hover:bg-muted/30"}`}>
              <div className="relative shrink-0">
                <div className={`w-7 h-7 rounded-sm ${avatarBg(m.id)} flex items-center justify-center text-[10px] text-background font-bold`}>
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${STATUS_DOT[m.focusState]} border border-background`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {m.name}{isYou && <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>}
                </p>
              </div>
              <FocusStatusBadge state={m.focusState} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
