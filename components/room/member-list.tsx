"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FocusStatusBadge } from "./focus-status-badge"
import type { FocusState } from "@/types"

type Member = { id: string; name: string; focusState: FocusState }

type Props = {
  members: Member[]
  currentUserId: string
}

export function MemberList({ members, currentUserId }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Members</h3>
      <div className="space-y-1.5">
        {members.map((m) => {
          const initials = m.name.slice(0, 2).toUpperCase()
          return (
            <div key={m.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1 truncate">{m.name}</span>
              <FocusStatusBadge state={m.focusState} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
