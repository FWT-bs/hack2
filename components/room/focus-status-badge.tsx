import { Badge } from "@/components/ui/badge"
import type { FocusState } from "@/types"

const CONFIG: Record<FocusState, { label: string; dot: string; className: string }> = {
  "on-task": {
    label: "On Task",
    dot: "bg-emerald-400",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
  },
  "warning": {
    label: "Warning",
    dot: "bg-amber-400",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400",
  },
  "locked": {
    label: "Locked",
    dot: "bg-rose-400",
    className: "bg-rose-500/10 text-rose-600 border-rose-500/25 dark:text-rose-400",
  },
  "approved-break": {
    label: "On Break",
    dot: "bg-sky-400",
    className: "bg-sky-500/10 text-sky-600 border-sky-500/25 dark:text-sky-400",
  },
}

export function FocusStatusBadge({ state }: { state: FocusState }) {
  const config = CONFIG[state]
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-2 py-0.5 gap-1.5 font-medium ${config.className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  )
}
