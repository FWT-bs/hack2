import { Badge } from "@/components/ui/badge"
import type { FocusState } from "@/types"

const CONFIG: Record<FocusState, { label: string; className: string }> = {
  "on-task": { label: "On Task", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "warning": { label: "Warning", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "locked": { label: "Locked", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  "approved-break": { label: "On Break", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
}

export function FocusStatusBadge({ state }: { state: FocusState }) {
  const config = CONFIG[state]
  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  )
}
