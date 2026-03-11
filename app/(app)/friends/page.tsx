import { Users } from "lucide-react"

export default function FriendsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Friends</h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Your friends and study circle will appear here. Add friends by username or invite link (coming soon).
        </p>
      </div>
    </div>
  )
}
