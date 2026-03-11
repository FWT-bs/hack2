"use client"

import { FocusStatusBadge } from "./focus-status-badge"
import type { FocusState } from "@/types"

type Member = { id: string; name: string; focusState: FocusState }

type Props = {
  members: Member[]
  currentUserId: string
}

const AVATAR_COLORS = [
  "bg-primary",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-emerald-600",
  "bg-pink-500",
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const STATUS_DOT: Record<FocusState, string> = {
  "on-task": "bg-emerald-400",
  "warning": "bg-amber-400",
  "locked": "bg-rose-400",
  "approved-break": "bg-sky-400",
}

export function MemberList({ members, currentUserId }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Members
        </h3>
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-xs text-muted-foreground">{members.length}</span>
      </div>

      <div className="space-y-1">
        {members.map((m) => {
          const isYou = m.id === currentUserId
          const initials = m.name.slice(0, 2).toUpperCase()
          const avatarColor = getAvatarColor(m.id)
          const dotColor = STATUS_DOT[m.focusState]

          return (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isYou ? "bg-primary/8 border border-primary/15" : "hover:bg-muted/50"
              }`}
            >
              {/* Avatar with status dot */}
              <div className="relative shrink-0">
                <div
                  className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-[11px] text-white font-bold`}
                >
                  {initials}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${dotColor} border-2 border-card`}
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.name}
                  {isYou && (
                    <span className="ml-1.5 text-[10px] text-primary font-normal">(you)</span>
                  )}
                </p>
              </div>

              {/* Status badge */}
              <FocusStatusBadge state={m.focusState} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
