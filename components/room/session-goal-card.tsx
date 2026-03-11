import { Target } from "lucide-react"

export function SessionGoalCard({ title, goal }: { title: string; goal: string }) {
  return (
    /* No card border — floats directly in the layout */
    <div className="flex items-start gap-3 py-1">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Target className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Session goal
        </p>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{goal}</p>
      </div>
    </div>
  )
}
