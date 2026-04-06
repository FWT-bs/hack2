import type { FocusState } from "@/types"

const CONFIG: Record<FocusState, { label: string; brightness: string }> = {
  "on-task": { label: "On task", brightness: "text-foreground bg-foreground/10 border-foreground/20" },
  warning: { label: "Drifting", brightness: "text-foreground/70 bg-foreground/5 border-foreground/15" },
  locked: { label: "Blocked", brightness: "text-foreground/50 bg-foreground/5 border-foreground/10" },
  "approved-break": { label: "Break", brightness: "text-foreground/60 bg-foreground/5 border-foreground/12" },
}

export function FocusStatusBadge({ state }: { state: FocusState }) {
  const c = CONFIG[state]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider border rounded-sm px-1.5 py-0.5 ${c.brightness}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  )
}
