import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your orbit
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Friends currently in session will appear here.
        </p>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          No one in session right now. Start a room and invite friends to see them here.
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl gap-2">
            <Link href="/rooms">
              <Plus className="h-4 w-4" />
              Start a room
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl gap-2">
            <Link href="/rooms">
              <MessageSquare className="h-4 w-4" />
              Join a room
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl gap-2">
            <Link href="/friends">
              <Users className="h-4 w-4" />
              Friends
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your rooms
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground text-center py-4">
            Active and recent rooms will show here. Create or join a room to get started.
          </p>
          <div className="flex justify-center">
            <Button asChild variant="secondary" className="rounded-xl">
              <Link href="/rooms">View all rooms</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
